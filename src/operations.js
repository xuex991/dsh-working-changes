import { lstat, mkdtemp, readdir, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import {
  basename,
  dirname,
  isAbsolute,
  join,
  normalize,
  relative,
  resolve,
  sep,
} from 'node:path'
import {
  GitError,
  gitFailure,
  parseCommitLog,
  parseNameStatus,
  parseNumstat,
  parsePorcelainStatus,
  parseUnifiedDiff,
} from './git.js'

const READ_TIMEOUT = 30000
const REPO_TIMEOUT = 15000
const DIFF_MAX_CHARS = 400000
const MAX_BRANCHES = 200
const MAX_BRANCH_COMMITS = 500
const TREE_HASH = /^[0-9a-f]{40,64}$/
const COMMIT_HASH = /^[0-9a-f]{40,64}$/i
const EMPTY_TREES = {
  sha1: '4b825dc642cb6eb9a060e54bf8d69288fbee4904',
  sha256: '6ef19b41225c5369f1c104d45d8d85efa9b057b53b14b4b9b939dd74decc5321',
}
const OPS = new Set(['snapshot', 'diff', 'history', 'commits', 'commit'])
const UNTRACKED_MODES = new Set(['list', 'ignore'])
const IGNORED_DIRS = new Set([
  '.git',
  '.cache',
  '.next',
  '.nuxt',
  '.turbo',
  '.yarn',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'target',
  'vendor',
])
const DEFAULTS = {
  discoverDepth: 1,
  repos: [],
  repoLabels: {},
  untracked: 'list',
  maxRepos: 20,
  concurrency: 4,
  repoTimeoutMs: REPO_TIMEOUT,
  maxBranches: MAX_BRANCHES,
  maxCommits: MAX_BRANCH_COMMITS,
}

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

function toPosix(path) {
  return path.split(sep).join('/')
}

function isInside(root, candidate) {
  const rel = relative(root, candidate)
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

function zeroSummary() {
  return { files: 0, additions: 0, deletions: 0, binary: 0 }
}

function readInteger(value, fallback, minimum, maximum, label) {
  if (value === undefined || value === null) return fallback
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new GitError(`${label} must be an integer from ${minimum} to ${maximum}.`, {
      code: 'invalid-params',
    })
  }
  return value
}

function readOptions(params = {}) {
  const repos = params.repos === undefined ? [] : params.repos
  if (!Array.isArray(repos) || repos.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new GitError('repos must be an array of workspace-relative paths.', {
      code: 'invalid-params',
    })
  }

  const repoLabels = params.repoLabels === undefined ? {} : params.repoLabels
  if (repoLabels === null || typeof repoLabels !== 'object' || Array.isArray(repoLabels)) {
    throw new GitError('repoLabels must be an object.', { code: 'invalid-params' })
  }
  for (const [key, value] of Object.entries(repoLabels)) {
    if (!key || typeof value !== 'string' || !value.trim()) {
      throw new GitError('repoLabels must map paths to non-empty names.', {
        code: 'invalid-params',
      })
    }
  }

  const untracked = params.untracked ?? DEFAULTS.untracked
  if (!UNTRACKED_MODES.has(untracked)) {
    throw new GitError('untracked must be list or ignore.', {
      code: 'invalid-params',
    })
  }

  return {
    discoverDepth: readInteger(
      params.discoverDepth,
      DEFAULTS.discoverDepth,
      0,
      10,
      'discoverDepth',
    ),
    repos: repos.map((item) => item.trim()),
    repoLabels,
    untracked,
    maxRepos: readInteger(params.maxRepos, DEFAULTS.maxRepos, 1, 1000, 'maxRepos'),
    concurrency: readInteger(params.concurrency, DEFAULTS.concurrency, 1, 32, 'concurrency'),
    repoTimeoutMs: readInteger(
      params.repoTimeoutMs,
      DEFAULTS.repoTimeoutMs,
      1000,
      120000,
      'repoTimeoutMs',
    ),
    maxBranches: readInteger(
      params.maxBranches,
      DEFAULTS.maxBranches,
      1,
      1000,
      'maxBranches',
    ),
    maxCommits: readInteger(
      params.maxCommits,
      DEFAULTS.maxCommits,
      1,
      5000,
      'maxCommits',
    ),
  }
}

function repoSignal(parentSignal, timeoutMs) {
  const controller = new AbortController()
  let timedOut = false
  const abort = () => controller.abort()
  if (parentSignal?.aborted) controller.abort()
  else parentSignal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)
  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    cleanup() {
      clearTimeout(timer)
      parentSignal?.removeEventListener('abort', abort)
    },
  }
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length)
  let next = 0
  async function drain() {
    while (next < items.length) {
      const index = next
      next += 1
      results[index] = await worker(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, drain))
  return results
}

async function hasGitMarker(directory) {
  try {
    const marker = await lstat(join(directory, '.git'))
    return marker.isDirectory() || marker.isFile() || marker.isSymbolicLink()
  } catch {
    return false
  }
}

function repoName(relPath, root, workspace) {
  return relPath === '.' ? basename(root) || basename(workspace) : basename(relPath)
}

function disambiguateNames(entries) {
  const counts = new Map()
  for (const entry of entries) counts.set(entry.baseName, (counts.get(entry.baseName) || 0) + 1)
  for (const entry of entries) {
    if ((counts.get(entry.baseName) || 0) < 2) continue
    const parent = basename(dirname(entry.relPath))
    if (parent && parent !== '.') entry.baseName = `${parent}/${entry.baseName}`
  }
}

export function createOperations(deps) {
  const { exec } = deps

  async function runGit(args, { cwd, signal, env, allowFailure = false, timeoutMs = READ_TIMEOUT }) {
    const argv = ['git', ...args]
    const result = await exec(argv, { cwd, signal, env, timeoutMs })
    if (result.code !== 0 && !allowFailure) throw gitFailure(argv, result)
    return result
  }

  async function findRepoRoot(cwd, signal) {
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

  async function workingTreeStatus(root, untracked, signal) {
    const result = await runGit([
      'status',
      '--porcelain=v1',
      '-z',
      untracked === 'ignore' ? '--untracked-files=no' : '--untracked-files=all',
    ], { cwd: root, signal })
    return parsePorcelainStatus(result.stdout)
  }

  function fileStates(status) {
    if (status?.conflicted) return ['conflicted']
    if (status?.untracked) return ['untracked']
    const states = []
    if (status?.stageStatus) states.push('staged')
    if (status?.worktreeStatus) states.push('unstaged')
    return states.length > 0 ? states : ['unstaged']
  }

  async function captureWorkingTree(root, untracked, signal) {
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
      await runGit(
        untracked === 'ignore'
          ? ['add', '--update', '--', '.']
          : ['add', '--all', '--', '.'],
        {
          cwd: root,
          signal,
          env,
          timeoutMs: 120000,
        },
      )
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
    return emptyTree(root, signal)
  }

  async function emptyTree(root, signal) {
    const format = await runGit(['rev-parse', '--show-object-format'], {
      cwd: root,
      signal,
    })
    return EMPTY_TREES[format.stdout.trim()] || EMPTY_TREES.sha1
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
    const summary = zeroSummary()
    for (const file of files) {
      if (file.binary) summary.binary += 1
      else {
        summary.additions += file.additions
        summary.deletions += file.deletions
      }
    }
    summary.files = files.length
    return summary
  }

  async function walkForRepos(workspace, directory, level, depth, signal, output) {
    if (signal?.aborted) return
    let entries
    try {
      entries = await readdir(directory, { withFileTypes: true })
    } catch {
      return
    }
    entries.sort((left, right) => left.name.localeCompare(right.name))
    for (const entry of entries) {
      if (!entry.isDirectory() || IGNORED_DIRS.has(entry.name)) continue
      const child = join(directory, entry.name)
      const relPath = toPosix(relative(workspace, child))
      if (await hasGitMarker(child)) {
        output.push({ root: child, relPath })
        continue
      }
      if (level < depth) {
        await walkForRepos(workspace, child, level + 1, depth, signal, output)
      }
    }
  }

  async function discoverRepositories(workspace, options, signal) {
    const direct = await findRepoRoot(workspace, signal)
    if (direct.root) {
      return {
        rootIsRepo: true,
        roots: [{ root: direct.root, relPath: '.' }],
        truncated: false,
        directError: direct.error,
      }
    }

    const roots = []
    let truncated = false
    if (options.repos.length > 0) {
      const seen = new Set()
      for (const configured of options.repos) {
        const normalized = normalize(configured)
        if (isAbsolute(configured) || normalized === '..' ||
            normalized.startsWith(`..${sep}`)) {
          throw new GitError('Configured repositories must stay inside the workspace.', {
            code: 'invalid-params',
          })
        }
        const root = resolve(workspace, configured)
        if (!isInside(workspace, root) || seen.has(root)) continue
        seen.add(root)
        roots.push({ root, relPath: toPosix(relative(workspace, root)) || '.' })
      }
    } else if (options.discoverDepth > 0) {
      await walkForRepos(workspace, workspace, 1, options.discoverDepth, signal, roots)
    }

    roots.sort((left, right) => left.relPath.localeCompare(right.relPath))
    if (roots.length > options.maxRepos) {
      roots.length = options.maxRepos
      truncated = true
    }
    return { rootIsRepo: false, roots, truncated, directError: direct.error }
  }

  function applyRepoMetadata(workspace, roots, options) {
    const entries = roots.map(({ root, relPath }) => ({
      root,
      relPath,
      baseName: repoName(relPath, root, workspace),
    }))
    disambiguateNames(entries)
    return entries.map((entry) => ({
      ...entry,
      id: entry.relPath,
      name: options.repoLabels[entry.relPath] || options.repoLabels[entry.root] || entry.baseName,
    }))
  }

  function enrichFiles(repo, files, statuses) {
    return files.map((file) => {
      const status = statuses?.get(file.path) || statuses?.get(file.oldPath) || null
      const relPath = repo.relPath === '.'
        ? file.path
        : `${repo.relPath}/${file.path}`
      const oldRelPath = file.oldPath
        ? (repo.relPath === '.' ? file.oldPath : `${repo.relPath}/${file.oldPath}`)
        : null
      return {
        ...file,
        repoId: repo.id,
        repoRoot: repo.root,
        repoName: repo.name,
        repoPath: file.path,
        relPath,
        workspacePath: relPath,
        oldRelPath,
        stageStatus: status?.stageStatus || null,
        worktreeStatus: status?.worktreeStatus || null,
        untracked: Boolean(status?.untracked),
        conflicted: Boolean(status?.conflicted),
        states: fileStates(status),
      }
    })
  }

  async function snapshotRepository(workspace, repo, options, parentSignal) {
    const timed = repoSignal(parentSignal, options.repoTimeoutMs)
    try {
      const [branch, baselineTree, currentTree, statuses] = await Promise.all([
        branchName(repo.root, timed.signal),
        headTree(repo.root, timed.signal),
        captureWorkingTree(repo.root, options.untracked, timed.signal),
        workingTreeStatus(repo.root, options.untracked, timed.signal),
      ])
      const files = baselineTree === currentTree
        ? []
        : await changeList(repo.root, baselineTree, currentTree, timed.signal)
      const enriched = enrichFiles(repo, files, statuses)
      return {
        id: repo.id,
        name: repo.name,
        relPath: repo.relPath,
        root: repo.root,
        branch: branch.branch,
        detached: branch.detached,
        baselineTree,
        currentTree,
        files: enriched,
        summary: summaryOf(enriched),
        error: null,
        errorCode: null,
        capturedAt: Date.now(),
      }
    } catch (error) {
      const message = timed.timedOut()
        ? `Repository snapshot timed out after ${options.repoTimeoutMs}ms.`
        : (error?.message ? String(error.message) : String(error))
      return {
        id: repo.id,
        name: repo.name,
        relPath: repo.relPath,
        root: repo.root,
        branch: null,
        detached: false,
        baselineTree: null,
        currentTree: null,
        files: [],
        summary: zeroSummary(),
        error: message.slice(0, 4000),
        errorCode: timed.timedOut() ? 'timeout' : (error?.code || 'git-failed'),
        capturedAt: Date.now(),
      }
    } finally {
      timed.cleanup()
    }
  }

  async function snapshot(params, signal) {
    const cwd = assertCwd(params.cwd)
    const options = readOptions(params)
    const discovery = await discoverRepositories(cwd, options, signal)
    const repositories = applyRepoMetadata(cwd, discovery.roots, options)
    const repos = await mapLimit(
      repositories,
      options.concurrency,
      (repo) => snapshotRepository(cwd, repo, options, signal),
    )
    const files = repos.flatMap((repo) => repo.files)
      .sort((left, right) => left.relPath.localeCompare(right.relPath))
    const summary = summaryOf(files)
    const failures = repos.filter((repo) => repo.error)
    const successes = repos.filter((repo) => !repo.error)
    const partial = failures.length > 0 && successes.length > 0
    const allFailed = repos.length > 0 && successes.length === 0
    const status = repos.length === 0
      ? 'no-repos'
      : allFailed
        ? 'failed'
        : files.length > 0
          ? 'changes'
          : 'clean'
    const single = discovery.rootIsRepo && repos.length === 1 ? repos[0] : null
    const legacyRepo = single
      ? {
          isRepo: true,
          root: single.root,
          branch: single.branch,
          detached: single.detached,
          error: single.error,
        }
      : {
          isRepo: false,
          root: null,
          branch: null,
          detached: false,
          error: discovery.directError || null,
        }

    return {
      repo: legacyRepo,
      baseline: single?.baselineTree
        ? { tree: single.baselineTree, root: single.root, capturedAt: single.capturedAt }
        : null,
      current: single?.currentTree ?? null,
      repos,
      files,
      summary,
      workspace: {
        root: cwd,
        rootIsRepo: discovery.rootIsRepo,
        multiRepo: !discovery.rootIsRepo,
        repositoryCount: repos.length,
        failedCount: failures.length,
        truncated: discovery.truncated,
        partial,
        allFailed,
        status,
      },
      captured: false,
    }
  }

  async function historyRepository(workspace, repo, options, parentSignal) {
    const timed = repoSignal(parentSignal, options.repoTimeoutMs)
    try {
      const [branch, refs] = await Promise.all([
        branchName(repo.root, timed.signal),
        runGit([
          'for-each-ref',
          '--format=%(refname:short)%1f%(objectname)%1f%(committerdate:unix)%1f%(subject)%1e',
          'refs/heads',
        ], { cwd: repo.root, signal: timed.signal }),
      ])
      const branches = []
      for (const chunk of refs.stdout.split('\x1e')) {
        const record = chunk.replace(/^\r?\n/, '')
        if (!record) continue
        const fields = record.split('\x1f')
        if (fields.length < 4 || !fields[0] || !COMMIT_HASH.test(fields[1])) continue
        branches.push({
          name: fields[0],
          sha: fields[1],
          timestamp: Number(fields[2]) || 0,
          subject: fields[3],
          current: !branch.detached && fields[0] === branch.branch,
        })
      }
      branches.sort((left, right) => (
        Number(right.current) - Number(left.current) ||
        right.timestamp - left.timestamp ||
        left.name.localeCompare(right.name)
      ))
      const truncated = branches.length > options.maxBranches
      if (truncated) branches.length = options.maxBranches
      return {
        id: repo.id,
        name: repo.name,
        relPath: repo.relPath,
        root: repo.root,
        branch: branch.branch,
        detached: branch.detached,
        branches,
        truncated,
        error: null,
        errorCode: null,
      }
    } catch (error) {
      const message = timed.timedOut()
        ? `Repository history timed out after ${options.repoTimeoutMs}ms.`
        : (error?.message ? String(error.message) : String(error))
      return {
        id: repo.id,
        name: repo.name,
        relPath: repo.relPath,
        root: repo.root,
        branch: null,
        detached: false,
        branches: [],
        truncated: false,
        error: message.slice(0, 4000),
        errorCode: timed.timedOut() ? 'timeout' : (error?.code || 'git-failed'),
      }
    } finally {
      timed.cleanup()
    }
  }

  async function history(params, signal) {
    const cwd = assertCwd(params.cwd)
    const options = readOptions(params)
    const discovery = await discoverRepositories(cwd, options, signal)
    const repositories = applyRepoMetadata(cwd, discovery.roots, options)
    const repos = await mapLimit(
      repositories,
      options.concurrency,
      (repo) => historyRepository(cwd, repo, options, signal),
    )
    const failures = repos.filter((repo) => repo.error)
    const successes = repos.filter((repo) => !repo.error)
    return {
      repos,
      workspace: {
        root: cwd,
        rootIsRepo: discovery.rootIsRepo,
        multiRepo: !discovery.rootIsRepo,
        repositoryCount: repos.length,
        failedCount: failures.length,
        truncated: discovery.truncated || repos.some((repo) => repo.truncated),
        partial: failures.length > 0 && successes.length > 0,
        allFailed: repos.length > 0 && successes.length === 0,
      },
      capturedAt: Date.now(),
    }
  }

  async function branchCommits(params, signal) {
    const cwd = assertCwd(params.cwd)
    const root = await resolveDiffRoot(cwd, params.repoRoot, signal)
    const branch = typeof params.branch === 'string' ? params.branch.trim() : ''
    if (!branch || branch.includes('\0')) {
      throw new GitError('A local branch name is required.', { code: 'invalid-params' })
    }
    const ref = `refs/heads/${branch}`
    const exists = await runGit(['show-ref', '--verify', '--quiet', ref], {
      cwd: root,
      signal,
      allowFailure: true,
    })
    if (exists.code !== 0) {
      throw new GitError(`Local branch not found: ${branch}`, { code: 'not-found' })
    }
    const options = readOptions(params)
    const [head, totalResult, log] = await Promise.all([
      runGit(['rev-parse', ref], { cwd: root, signal }),
      runGit(['rev-list', '--count', ref], { cwd: root, signal }),
      runGit([
        'log',
        '--date-order',
        `--max-count=${options.maxCommits + 1}`,
        '--format=%H%x1f%P%x1f%ct%x1f%an%x1f%s%x1e',
        ref,
      ], { cwd: root, signal }),
    ])
    let commits = parseCommitLog(log.stdout)
    const truncated = commits.length > options.maxCommits
    if (truncated) commits = commits.slice(0, options.maxCommits)
    commits.sort((left, right) => (
      right.timestamp - left.timestamp ||
      right.sha.localeCompare(left.sha)
    ))
    return {
      branch,
      sha: head.stdout.trim(),
      commits,
      total: Number(totalResult.stdout.trim()) || commits.length,
      truncated,
      capturedAt: Date.now(),
    }
  }

  async function commitView(params, signal) {
    const cwd = assertCwd(params.cwd)
    const root = await resolveDiffRoot(cwd, params.repoRoot, signal)
    const requested = typeof params.commit === 'string' ? params.commit.trim() : ''
    if (!COMMIT_HASH.test(requested)) {
      throw new GitError('commit must be a full Git commit hash.', { code: 'invalid-params' })
    }
    const resolved = await runGit(['rev-parse', '--verify', `${requested}^{commit}`], {
      cwd: root,
      signal,
      allowFailure: true,
    })
    if (resolved.code !== 0 || !resolved.stdout.trim()) {
      throw new GitError(`Commit not found: ${requested}`, { code: 'not-found' })
    }
    const sha = resolved.stdout.trim()
    const log = await runGit([
      'show',
      '-s',
      '--format=%H%x1f%P%x1f%ct%x1f%an%x1f%s%x1e',
      sha,
    ], { cwd: root, signal })
    const metadata = parseCommitLog(log.stdout)[0]
    if (!metadata) {
      throw new GitError(`Could not read commit metadata: ${sha}`, { code: 'git-failed' })
    }
    const treeResult = await runGit(['rev-parse', `${sha}^{tree}`], { cwd: root, signal })
    let baselineTree = await emptyTree(root, signal)
    if (metadata.parents[0]) {
      const parentTree = await runGit([
        'rev-parse',
        `${metadata.parents[0]}^{tree}`,
      ], { cwd: root, signal, allowFailure: true })
      if (parentTree.code === 0 && parentTree.stdout.trim()) {
        baselineTree = parentTree.stdout.trim()
      }
    }
    const currentTree = treeResult.stdout.trim()
    const files = baselineTree === currentTree
      ? []
      : await changeList(root, baselineTree, currentTree, signal)
    return {
      repoRoot: root,
      commit: {
        ...metadata,
        shortSha: metadata.sha.slice(0, 7),
        parentCount: metadata.parents.length,
        isMerge: metadata.parents.length > 1,
      },
      baselineTree,
      currentTree,
      files,
      summary: summaryOf(files),
    }
  }

  async function resolveDiffRoot(cwd, requestedRoot, signal) {
    if (requestedRoot === undefined || requestedRoot === null || requestedRoot === '') {
      const resolved = await findRepoRoot(cwd, signal)
      if (!resolved.root) {
        throw new GitError('The session working directory is not a Git repository.', {
          code: 'not-a-repo',
        })
      }
      return resolved.root
    }
    if (typeof requestedRoot !== 'string' || !isAbsolute(requestedRoot) ||
        requestedRoot.includes('\0')) {
      throw new GitError('repoRoot must be an absolute path.', { code: 'invalid-params' })
    }
    let root
    let workspace
    try {
      [root, workspace] = await Promise.all([realpath(requestedRoot), realpath(cwd)])
    } catch {
      throw new GitError('repoRoot or the workspace is unavailable.', { code: 'cwd-unavailable' })
    }
    if (!isInside(workspace, root) && !isInside(root, workspace)) {
      throw new GitError('repoRoot must contain the workspace or be inside it.', {
        code: 'invalid-params',
      })
    }
    const resolved = await findRepoRoot(root, signal)
    if (!resolved.root) {
      throw new GitError('repoRoot is not a Git repository.', { code: 'not-a-repo' })
    }
    const canonical = await realpath(resolved.root)
    if (canonical !== root) {
      throw new GitError('repoRoot must be the repository root.', { code: 'invalid-params' })
    }
    return root
  }

  async function diff(params, signal) {
    const cwd = assertCwd(params.cwd)
    const root = await resolveDiffRoot(cwd, params.repoRoot, signal)
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
      if (op === 'snapshot') return snapshot(params, signal)
      if (op === 'diff') return diff(params, signal)
      if (op === 'history') return history(params, signal)
      if (op === 'commits') return branchCommits(params, signal)
      return commitView(params, signal)
    },
  }
}
