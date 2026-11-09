import { spawn } from 'node:child_process'

/** Minimal subprocess shim matching the shape index.js gives src/operations.js. */
export function makeExec() {
  return async function exec(argv, options = {}) {
    const { cwd, signal, timeoutMs = 30000, env } = options
    const child = spawn(argv[0], argv.slice(1), {
      cwd,
      env: { ...process.env, ...(env || {}) },
      signal,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let out = ''
    let err = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => { out += chunk })
    child.stderr.on('data', (chunk) => { err += chunk })
    const done = new Promise((resolve, reject) => {
      child.on('error', reject)
      child.on('close', (code) => resolve(code))
    })
    const timer = setTimeout(() => { try { child.kill('SIGKILL') } catch {} }, Math.max(100, timeoutMs))
    try {
      const code = await done
      return { code, stdout: out, stderr: err }
    } finally {
      clearTimeout(timer)
    }
  }
}
