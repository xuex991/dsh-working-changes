import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
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
  await git(['init', '-q'], { cwd: root })
  await git(['config', 'user.email', 'session-changes@example.test'], { cwd: root })
  await git(['config', 'user.name', 'Session Changes Test'], { cwd: root })
  await mkdir(join(root, 'src'))
  await writeFile(join(root, 'src', 'app.js'), 'one\ntwo\n')
  await writeFile(join(root, 'old-name.txt'), 'rename me\n')
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
