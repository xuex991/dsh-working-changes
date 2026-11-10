import { GitError, cleanGitEnv } from './src/git.js'
import { createOperations } from './src/operations.js'

export const name = 'session-changes'
export const inject = ['connection', 'sessionPersistence', 'sessions', 'subprocess']

const ROUTE_PATH = '/api/session-changes'
const STDOUT_MAX_BYTES = 18 * 1024 * 1024
const STDERR_MAX_BYTES = 1024 * 1024

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

function readCollected(handle, stream) {
  try {
    return handle?.collected?.[stream]?.readFrom(0)?.text ?? ''
  } catch {
    return ''
  }
}

function createExec(ctx) {
  return async function exec(argv, options = {}) {
    const { cwd, signal, timeoutMs = 30000, env } = options
    const controller = new AbortController()
    let timedOut = false
    const abort = () => controller.abort()

    if (signal?.aborted) controller.abort()
    else signal?.addEventListener('abort', abort, { once: true })

    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, Math.max(100, timeoutMs))

    try {
      const handle = ctx.subprocess.spawn({
        argv,
        cwd,
        env: cleanGitEnv(env),
        stdio: {
          stdin: 'ignore',
          stdout: { maxBytes: STDOUT_MAX_BYTES },
          stderr: { maxBytes: STDERR_MAX_BYTES },
        },
        graceMs: 3000,
        signal: controller.signal,
      })
      const outcome = await handle.done
      const stdout = readCollected(handle, 'stdout')
      const stderr = readCollected(handle, 'stderr')
      if (timedOut || controller.signal.aborted) {
        throw new GitError(`git command timed out: ${argv.join(' ')}`, {
          code: 'timeout',
          stdout,
          stderr,
        })
      }
      return { code: outcome.exitCode, stdout, stderr }
    } catch (error) {
      if (error instanceof GitError) throw error
      const message = error?.message ? String(error.message) : String(error)
      const code = error?.code === 'ENOENT' || /\bENOENT\b/.test(message)
        ? 'cwd-unavailable'
        : 'internal'
      throw new GitError(
        code === 'cwd-unavailable'
          ? `Working directory or git executable is unavailable: ${cwd}`
          : `Could not run ${argv.join(' ')}: ${message}`,
        { code },
      )
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
    }
  }
}

async function handleRequest(request, operations) {
  if (request.method !== 'POST') {
    return jsonResponse(405, {
      ok: false,
      error: { code: 'invalid-params', message: 'Only POST is supported.' },
    })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse(400, {
      ok: false,
      error: { code: 'invalid-params', message: 'Request body must be valid JSON.' },
    })
  }

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return jsonResponse(400, {
      ok: false,
      error: { code: 'invalid-params', message: 'Request body must be a JSON object.' },
    })
  }

  const { op, ...params } = body
  try {
    const data = await operations.handle(op, params, request.signal)
    return jsonResponse(200, { ok: true, data })
  } catch (error) {
    const invalid = error instanceof GitError && error.code === 'invalid-params'
    const message = error?.message ? String(error.message).slice(0, 4000) : String(error)
    return jsonResponse(invalid ? 400 : 200, {
      ok: false,
      error: {
        code: error instanceof GitError ? error.code : 'internal',
        message,
      },
    })
  }
}

export function apply(ctx) {
  const operations = createOperations({
    exec: createExec(ctx),
    sessionStart: async (sessionId) => {
      const live = ctx.sessions?.get?.(sessionId)?.header?.createdAt
      if (Number.isFinite(live)) return live
      try {
        const stored = await ctx.sessionPersistence?.stat?.(sessionId)
        const createdAt = stored?.header?.createdAt
        return Number.isFinite(createdAt) ? createdAt : null
      } catch {
        return null
      }
    },
  })
  ctx.effect(() => {
    const dispose = ctx.connection.fetch.register({
      path: ROUTE_PATH,
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: (request) => handleRequest(request, operations),
    })
    return () => {
      void dispose()
    }
  }, 'session-changes: authenticated snapshot route')
}
