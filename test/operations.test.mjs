import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { promisify } from 'node:util'
import { createOperations } from '../src/operations.js'

const run = promisify(execFile)

async function exec(argv, options = {}) {
  try {
    const result = await run(argv[0], argv.slice(1), {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      maxBuffer: 20 * 1024 * 1024,
    })
    return { code: 0, stdout: result.stdout, stderr: result.stderr }
  } catch (error) {
    return {
      code: typeof error.code === 'number' ? error.code : 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? String(error),
    }
  }
}

async function git(args, options = {}) {
  return exec(['git', ...args], options)
}

async function repoFixture() {
  const root = await mkdtemp(join(tmpdir(), 'dsh-session-changes-test-'))
  await initRepo(root)
  await mkdir(join(root, 'src'))
  await writeFile(join(root, 'src', 'app.js'), 'one\ntwo\n')
  await writeFile(join(root, 'old-name.txt'), 'rename me\n')
  await git(['add', '.'], { cwd: root })
  await git(['commit', '-qm', 'initial'], { cwd: root })
  return root
}

async function initRepo(root, files = {}) {
  await mkdir(root, { recursive: true })
  await git(['init', '-q'], { cwd: root })
  await git(['config', 'user.email', 'session-changes@example.test'], { cwd: root })
  await git(['config', 'user.name', 'Session Changes Test'], { cwd: root })
  for (const [path, contents] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true })
    await writeFile(join(root, path), contents)
  }
}

async function commitRepo(root, files = {}) {
  await initRepo(root, files)
  await git(['add', '.'], { cwd: root })
  await git(['commit', '-qm', 'initial'], { cwd: root })
  return root
}

test('snapshot shows the workspace changes normally reported by git status', async (t) => {
  const root = await repoFixture()
  t.after(() => rm(root, { recursive: true, force: true }))
  const operations = createOperations({ exec })

  // Ordinary git status semantics include every uncommitted change, regardless of age.
  await writeFile(join(root, 'before-session.txt'), 'already dirty\n')
  let snapshot = await operations.handle('snapshot', { cwd: root })
  assert.equal(snapshot.summary.files, 1)

  await writeFile(join(root, 'src', 'app.js'), 'one\nTWO\nthree\n')
  await writeFile(join(root, 'after-session.txt'), 'new\n')
  snapshot = await operations.handle('snapshot', { cwd: root })

  assert.deepEqual(snapshot.files.map((file) => file.path), [
    'after-session.txt',
    'before-session.txt',
    'src/app.js',
  ])
  assert.deepEqual(snapshot.summary, {
    files: 3,
    additions: 4,
    deletions: 1,
    binary: 0,
  })
  assert.equal(snapshot.repos.length, 1)
  assert.equal(snapshot.workspace.rootIsRepo, true)
  assert.equal(snapshot.workspace.multiRepo, false)
  assert.equal(snapshot.repos[0].summary.files, 3)
  assert.equal(snapshot.files[0].repoId, '.')
  assert.equal(snapshot.files[0].repoPath, snapshot.files[0].path)
  assert.equal(snapshot.files[0].relPath, snapshot.files[0].path)

  const diff = await operations.handle('diff', {
    cwd: root,
    baselineTree: snapshot.baseline.tree,
    currentTree: snapshot.current,
    path: 'src/app.js',
  })
  assert.equal(diff.additions, 2)
  assert.equal(diff.deletions, 1)
  assert.equal(diff.hunks.length, 1)
  assert.deepEqual(
    diff.hunks[0].lines.filter((line) => line.kind !== 'ctx').map((line) => [line.kind, line.text]),
    [['del', 'two'], ['add', 'TWO'], ['add', 'three']],
  )
})

test('returning a file to HEAD removes it from the change list', async (t) => {
  const root = await repoFixture()
  t.after(() => rm(root, { recursive: true, force: true }))
  const operations = createOperations({ exec })
  await operations.handle('snapshot', { cwd: root })

  await writeFile(join(root, 'src', 'app.js'), 'changed\n')
  let snapshot = await operations.handle('snapshot', { cwd: root })
  assert.equal(snapshot.summary.files, 1)

  await writeFile(join(root, 'src', 'app.js'), 'one\ntwo\n')
  snapshot = await operations.handle('snapshot', { cwd: root })
  assert.equal(snapshot.summary.files, 0)
  assert.equal(snapshot.files.length, 0)
})

test('rename and binary changes are represented in the list', async (t) => {
  const root = await repoFixture()
  t.after(() => rm(root, { recursive: true, force: true }))
  const operations = createOperations({ exec })
  await operations.handle('snapshot', { cwd: root })

  await rename(join(root, 'old-name.txt'), join(root, 'new-name.txt'))
  await writeFile(join(root, 'asset.bin'), Buffer.from([0, 1, 2, 3, 255]))
  const snapshot = await operations.handle('snapshot', { cwd: root })

  const renameEntry = snapshot.files.find((file) => file.path === 'new-name.txt')
  const binaryEntry = snapshot.files.find((file) => file.path === 'asset.bin')
  assert.equal(renameEntry?.status, 'R')
  assert.equal(renameEntry?.oldPath, 'old-name.txt')
  assert.equal(binaryEntry?.status, 'A')
  assert.equal(binaryEntry?.binary, true)
})

test('discovers sibling repositories and keeps each diff scoped to its repository', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dsh-multi-repo-test-'))
  t.after(() => rm(workspace, { recursive: true, force: true }))
  const frontend = join(workspace, 'frontend')
  const backend = join(workspace, 'backend')
  await commitRepo(frontend, {
    'src/app.js': 'front\n',
  })
  await commitRepo(backend, {
    'src/server.js': 'server one\nserver two\n',
  })
  await writeFile(join(frontend, 'src', 'app.js'), 'front\nnext\n')
  await writeFile(join(backend, 'src', 'server.js'), 'server ONE\nserver two\n')
  await writeFile(join(backend, 'added.txt'), 'new\n')

  const operations = createOperations({ exec })
  const snapshot = await operations.handle('snapshot', { cwd: workspace })

  assert.equal(snapshot.workspace.rootIsRepo, false)
  assert.equal(snapshot.workspace.multiRepo, true)
  assert.equal(snapshot.repos.length, 2)
  assert.deepEqual(snapshot.repos.map((repo) => repo.name), ['backend', 'frontend'])
  assert.deepEqual(snapshot.repos.map((repo) => repo.summary.files), [2, 1])
  assert.deepEqual(snapshot.summary, {
    files: 3,
    additions: 3,
    deletions: 1,
    binary: 0,
  })
  assert.deepEqual(snapshot.files.map((file) => file.relPath), [
    'backend/added.txt',
    'backend/src/server.js',
    'frontend/src/app.js',
  ])

  const frontendFile = snapshot.files.find((file) => file.relPath === 'frontend/src/app.js')
  const frontendRepo = snapshot.repos.find((repo) => repo.id === 'frontend')
  const frontendDiff = await operations.handle('diff', {
    cwd: workspace,
    repoRoot: frontendRepo.root,
    baselineTree: frontendRepo.baselineTree,
    currentTree: frontendRepo.currentTree,
    path: frontendFile.path,
  })
  assert.deepEqual(
    frontendDiff.hunks[0].lines.filter((line) => line.kind === 'add').map((line) => line.text),
    ['next'],
  )

  const backendFile = snapshot.files.find((file) => file.relPath === 'backend/added.txt')
  const backendRepo = snapshot.repos.find((repo) => repo.id === 'backend')
  const backendDiff = await operations.handle('diff', {
    cwd: workspace,
    repoRoot: backendRepo.root,
    baselineTree: backendRepo.baselineTree,
    currentTree: backendRepo.currentTree,
    path: backendFile.path,
  })
  assert.equal(backendDiff.additions, 1)
  assert.equal(backendDiff.deletions, 0)
})

test('repository without HEAD is treated as empty baseline and all files are additions', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dsh-empty-repo-test-'))
  t.after(() => rm(workspace, { recursive: true, force: true }))
  const repo = join(workspace, 'fresh')
  await initRepo(repo, { 'index.js': 'export const ready = true\n' })

  const operations = createOperations({ exec })
  const snapshot = await operations.handle('snapshot', { cwd: workspace })

  assert.equal(snapshot.repos.length, 1)
  assert.equal(snapshot.repos[0].error, null)
  assert.equal(snapshot.repos[0].baselineTree, '4b825dc642cb6eb9a060e54bf8d69288fbee4904')
  assert.equal(snapshot.files.length, 1)
  assert.equal(snapshot.files[0].status, 'A')
})

test('one unreadable repository does not hide changes from other repositories', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dsh-partial-repo-test-'))
  t.after(() => rm(workspace, { recursive: true, force: true }))
  const good = join(workspace, 'good')
  const broken = join(workspace, 'broken')
  await commitRepo(good, { 'file.txt': 'before\n' })
  await writeFile(join(good, 'file.txt'), 'after\n')
  await mkdir(join(broken, '.git'), { recursive: true })

  const operations = createOperations({ exec })
  const snapshot = await operations.handle('snapshot', {
    cwd: workspace,
    repoTimeoutMs: 3000,
  })

  assert.equal(snapshot.repos.length, 2)
  assert.equal(snapshot.workspace.partial, true)
  assert.equal(snapshot.workspace.failedCount, 1)
  assert.equal(snapshot.files.length, 1)
  assert.equal(snapshot.files[0].relPath, 'good/file.txt')
  assert.match(snapshot.repos.find((repo) => repo.name === 'broken').error, /git|not|repository/i)
})

test('explicit repository list disables automatic discovery', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dsh-explicit-repo-test-'))
  t.after(() => rm(workspace, { recursive: true, force: true }))
  await commitRepo(join(workspace, 'alpha'), { 'a.txt': 'a\n' })
  await commitRepo(join(workspace, 'beta'), { 'b.txt': 'b\n' })
  await writeFile(join(workspace, 'alpha', 'a.txt'), 'A\n')
  await writeFile(join(workspace, 'beta', 'b.txt'), 'B\n')

  const operations = createOperations({ exec })
  const snapshot = await operations.handle('snapshot', {
    cwd: workspace,
    repos: ['beta'],
    repoLabels: { beta: 'Backend API' },
  })

  assert.equal(snapshot.repos.length, 1)
  assert.equal(snapshot.repos[0].name, 'Backend API')
  assert.deepEqual(snapshot.files.map((file) => file.relPath), ['beta/b.txt'])
})

test('untracked ignore mode leaves new files out of the snapshot', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dsh-untracked-test-'))
  t.after(() => rm(workspace, { recursive: true, force: true }))
  const repo = join(workspace, 'repo')
  await commitRepo(repo, { 'tracked.txt': 'same\n' })
  await writeFile(join(repo, 'untracked.txt'), 'new\n')

  const operations = createOperations({ exec })
  const listed = await operations.handle('snapshot', { cwd: workspace })
  const ignored = await operations.handle('snapshot', {
    cwd: workspace,
    untracked: 'ignore',
  })

  assert.equal(listed.files.length, 1)
  assert.equal(ignored.files.length, 0)
})

test('invalid operations and paths are rejected', async (t) => {
  const root = await repoFixture()
  t.after(() => rm(root, { recursive: true, force: true }))
  const operations = createOperations({ exec })

  await assert.rejects(
    operations.handle('unknown', { cwd: root }),
    (error) => error.code === 'invalid-params',
  )
  await assert.rejects(
    operations.handle('diff', {
      cwd: root,
      baselineTree: 'not-a-tree',
      currentTree: 'not-a-tree',
      path: 'src/app.js',
    }),
    (error) => error.code === 'invalid-params',
  )
})
