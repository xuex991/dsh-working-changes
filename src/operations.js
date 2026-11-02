import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { isAbsolute, join, normalize, relative, sep } from 'node:path'
import {
  GitError,
  gitFailure,
  parseNameStatus,
  parseNumstat,
  parseUnifiedDiff,
} from './git.js'

const READ_TIMEOUT = 30000
const DIFF_MAX_CHARS = 400000
const TREE_HASH = /^[0-9a-f]{40,64}$/
const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'
const OPS = new Set(['snapshot', 'diff'])

function assertCwd(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new GitError('A working directory is required.', { code: 'invalid-params' })
  }
  if (!isAbsolute(value) || value.includes('\0')) {
    throw new GitError('The working directory must be an absolute path.', { code: 'invalid-params' })
  }
  return normalize(value)
}

function assertTree(value, label) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string' || !TREE_HASH.test(value)) {
    throw new GitError(`${label} must be a Git tree hash.`, { code: 'invalid-params' })
  }
  return value
}

function assertRelativeFile(value, root) {
  if (typeof value !== 'string' || value === '' || value.includes('\0')) {
    throw new GitError('A file path is required.', { code: 'invalid-params' })
  }
  if (isAbsolute(value)) {
    throw new GitError('The file path must be repository-relative.', { code: 'invalid-params' })
  }
  const normalized = normalize(value)
  if (normalized === '..' || normalized.startsWith(`..${sep}`)) {
    throw new GitError('The file path cannot leave the repository.', { code: 'invalid-params' })
  }
  const rootRelative = relative(root, join(root, normalized))
  if (rootRelative.startsWith('..') || isAbsolute(rootRelative)) {
    throw new GitError('The file path cannot leave the repository.', { code: 'invalid-params' })
  }
  return normalized.split(sep).join('/')
}

export function createOperations(deps) {
  const { exec } = deps

  async function runGit(args, { cwd, signal, env, allowFailure = false, timeoutMs = READ_TIMEOUT }) {
    const argv = ['git', ...args]
    const result = await exec(argv, { cwd, signal, env, timeoutMs })
    if (result.code !== 0 && !allowFailure) throw gitFailure(argv, result)
    return result
  }

  async function repoRoot(cwd, signal) {
    const result = await runGit(['rev-parse', '--show-toplevel'], {
      cwd,
      signal,
      allowFailure: true,
    })
    if (result.code !== 0) {
      return {
        root: null,
        error: [result.stderr, result.stdout].filter(Boolean).join('\n').trim(),
      }
    }
    return { root: result.stdout.trim() || null, error: null }
  }

  async function branchName(root, signal) {
    const symbolic = await runGit(['symbolic-ref', '--quiet', '--short', 'HEAD'], {
      cwd: root,
      signal,
      allowFailure: true,
    })
    if (symbolic.code === 0 && symbolic.stdout.trim()) {
      return { branch: symbolic.stdout.trim(), detached: false }
    }
    const head = await runGit(['rev-parse', '--short', 'HEAD'], {
      cwd: root,
      signal,
      allowFailure: true,
    })
    return {
      branch: head.code === 0 && head.stdout.trim() ? head.stdout.trim() : null,
      detached: true,
    }
  }

  async function captureWorkingTree(root, signal) {
    const temp = await mkdtemp(join(tmpdir(), 'dsh-session-changes-'))
    const env = { GIT_INDEX_FILE: join(temp, 'index') }
    try {
      const readHead = await runGit(['read-tree', 'HEAD'], {
        cwd: root,
        signal,
        env,
        allowFailure: true,
      })
      if (readHead.code !== 0) {
        await runGit(['read-tree', '--empty'], { cwd: root, signal, env })
      }
      await runGit(['add', '--all', '--', '.'], {
        cwd: root,
        signal,
        env,
        timeoutMs: 120000,
      })
      const written = await runGit(['write-tree'], { cwd: root, signal, env })
      return written.stdout.trim()
    } finally {
      await rm(temp, { recursive: true, force: true }).catch(() => {})
    }
  }

  async function headTree(root, signal) {
    const result = await runGit(['rev-parse', 'HEAD^{tree}'], {
      cwd: root,
      signal,
      allowFailure: true,
    })
    if (result.code === 0 && result.stdout.trim()) return result.stdout.trim()
    return EMPTY_TREE
  }

  async function changeList(root, baselineTree, currentTree, signal) {
    const [names, numbers] = await Promise.all([
      runGit(
        ['diff', '--name-status', '-z', '--find-renames', baselineTree, currentTree],
        { cwd: root, signal },
      ),
      runGit(
        ['diff', '--numstat', '-z', '--find-renames', baselineTree, currentTree],
        { cwd: root, signal },
      ),
    ])

    const entries = parseNameStatus(names.stdout)
    const stats = parseNumstat(numbers.stdout)
    const files = entries.map((entry) => {
      const stat = stats.get(entry.path) ?? { additions: 0, deletions: 0 }
      return {
        path: entry.path,
        oldPath: entry.oldPath,
        status: entry.status,
        additions: stat.additions,
        deletions: stat.deletions,
        binary: stat.additions === null || stat.deletions === null,
      }
    })
    files.sort((left, right) => left.path.localeCompare(right.path))
    return files
  }

  function summaryOf(files) {
    const summary = { files: files.length, additions: 0, deletions: 0, binary: 0 }
    for (const file of files) {
      if (file.binary) summary.binary += 1
      else {
        summary.additions += file.additions
        summary.deletions += file.deletions
      }
    }
    return summary
  }

  async function snapshot(params, signal) {
    const cwd = assertCwd(params.cwd)
    const resolved = await repoRoot(cwd, signal)

    if (!resolved.root) {
      return {
        repo: {
          isRepo: false,
          root: null,
          branch: null,
          detached: false,
          error: resolved.error || null,
        },
        baseline: null,
        current: null,
        files: [],
        summary: { files: 0, additions: 0, deletions: 0, binary: 0 },
        captured: false,
      }
    }

    const root = resolved.root
    const branch = await branchName(root, signal)
    const baselineTree = await headTree(root, signal)
    const currentTree = await captureWorkingTree(root, signal)
    const files = baselineTree === currentTree
      ? []
      : await changeList(root, baselineTree, currentTree, signal)

    return {
      repo: {
        isRepo: true,
        root,
        branch: branch.branch,
        detached: branch.detached,
        error: null,
      },
      baseline: {
        tree: baselineTree,
        root,
        capturedAt: Date.now(),
      },
      current: currentTree,
      files,
      summary: summaryOf(files),
      captured: false,
    }
  }

  async function diff(params, signal) {
    const cwd = assertCwd(params.cwd)
    const resolved = await repoRoot(cwd, signal)
    if (!resolved.root) {
      throw new GitError('The session working directory is not a Git repository.', {
        code: 'not-a-repo',
      })
    }

    const root = resolved.root
    const baselineTree = assertTree(params.baselineTree, 'Baseline tree')
    const currentTree = assertTree(params.currentTree, 'Current tree')
    if (!baselineTree || !currentTree) {
      throw new GitError('Both baselineTree and currentTree are required.', {
        code: 'invalid-params',
      })
    }
    const path = assertRelativeFile(params.path, root)
    const result = await runGit(
      [
        'diff',
        '--no-color',
        '--no-ext-diff',
        '--find-renames',
        '--unified=3',
        baselineTree,
        currentTree,
        '--',
        path,
      ],
      { cwd: root, signal, allowFailure: true },
    )
    if (result.code !== 0) throw gitFailure(['git', 'diff'], result)

    let raw = result.stdout
    const originalLength = raw.length
    if (raw.length > DIFF_MAX_CHARS) raw = raw.slice(0, DIFF_MAX_CHARS)
    const parsed = parseUnifiedDiff(raw)
    return {
      path,
      binary: parsed.binary,
      additions: parsed.additions,
      deletions: parsed.deletions,
      hunks: parsed.hunks,
      truncated: originalLength > DIFF_MAX_CHARS,
      originalLength,
    }
  }

  return {
    async handle(op, params, signal) {
      if (!OPS.has(op)) {
        throw new GitError(`Unknown operation: ${String(op)}`, { code: 'invalid-params' })
      }
      return op === 'snapshot'
        ? snapshot(params, signal)
        : diff(params, signal)
    },
  }
}
