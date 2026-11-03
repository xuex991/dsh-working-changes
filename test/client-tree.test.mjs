import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'

async function loadClientTestApi() {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  let definition
  const context = {
    __DSH_WORKING_CHANGES_TEST__: true,
    console,
    setTimeout,
    clearTimeout,
    window: {
      __ModuleLoader__: {
        load(value) {
          definition = value
        },
      },
    },
  }
  vm.runInNewContext(source, context, { filename: 'lib/client.js' })
  assert.ok(definition, 'client module should register with the DSH module loader')

  const react = {
    createElement() {
      return null
    },
    Fragment: Symbol('Fragment'),
    useCallback() {},
    useEffect() {},
    useMemo() {},
    useRef() {},
    useState() {},
  }
  const plugin = definition.factory((id) => {
    if (id === 'react') return react
    throw new Error(`Unexpected client dependency: ${id}`)
  })
  return plugin.__test
}

function changeFile(path, status, extra = {}) {
  return {
    path,
    relPath: path,
    repoId: '.',
    repoName: 'demo',
    status,
    additions: 1,
    deletions: 0,
    binary: false,
    ...extra,
  }
}

test('change tree contains only directories that lead to changed files', async () => {
  const { buildChangeTree } = await loadClientTestApi()
  const files = [
    changeFile('README.md', 'M'),
    changeFile('docs/api/API.md', 'A'),
    changeFile('src/parser.js', 'M'),
    changeFile('src/deep/nested/parser.test.js', 'A'),
  ]

  const tree = buildChangeTree(files)
  const dirPaths = (dirs) => Array.from(dirs, (dir) => dir.path)
  const filePaths = (entries) => Array.from(entries, (file) => file.path)

  assert.deepEqual(dirPaths(tree.dirs), ['docs', 'src'])
  assert.deepEqual(dirPaths(tree.dirs[0].dirs), ['docs/api'])
  assert.deepEqual(dirPaths(tree.dirs[1].dirs), ['src/deep'])
  assert.deepEqual(dirPaths(tree.dirs[1].dirs[0].dirs), ['src/deep/nested'])
  assert.equal(tree.dirs[1].allFiles.length, 2)
  assert.deepEqual(filePaths(tree.files), ['README.md'])
})

test('search matches paths and old rename paths then keeps their ancestors', async () => {
  const { filterChangeFiles, grouping } = await loadClientTestApi()
  const files = [
    changeFile('README.md', 'M'),
    changeFile('src/deep/nested/parser.js', 'M'),
    changeFile('src/renamed.js', 'R', { oldPath: 'legacy/old-parser.js' }),
  ]
  const data = {
    files,
    repo: { root: '/tmp/demo' },
    repos: [{ id: '.', name: 'demo', relPath: '.', branch: 'main' }],
    workspace: { multiRepo: false },
  }

  assert.deepEqual(
    Array.from(filterChangeFiles(files, 'nested'), (file) => file.path),
    ['src/deep/nested/parser.js'],
  )
  assert.deepEqual(
    Array.from(filterChangeFiles(files, 'legacy'), (file) => file.path),
    ['src/renamed.js'],
  )

  const filtered = grouping(data, 'nested').sections[0]
  assert.deepEqual(Array.from(filtered.tree.dirs, (dir) => dir.path), ['src'])
  assert.deepEqual(Array.from(filtered.tree.dirs[0].dirs, (dir) => dir.path), ['src/deep'])
  assert.deepEqual(Array.from(filtered.tree.dirs[0].allFiles, (file) => file.path), [
    'src/deep/nested/parser.js',
  ])
})

test('directory status summarizes mixed changes as modified', async () => {
  const { buildChangeTree, directoryStatus } = await loadClientTestApi()
  const tree = buildChangeTree([
    changeFile('src/added.js', 'A'),
    changeFile('src/changed.js', 'M'),
    changeFile('docs/api/README.md', 'A'),
  ])
  const src = tree.dirs.find((dir) => dir.path === 'src')
  const docs = tree.dirs.find((dir) => dir.path === 'docs')

  assert.equal(directoryStatus(src), 'M')
  assert.equal(directoryStatus(docs), 'A')
})

test('current state filters separate staged, unstaged, untracked, and conflicted files', async () => {
  const { filterChangeFiles, stateCounts } = await loadClientTestApi()
  const files = [
    changeFile('staged.js', 'M', { states: ['staged'] }),
    changeFile('both.js', 'M', { states: ['staged', 'unstaged'] }),
    changeFile('new.js', 'A', { states: ['untracked'] }),
    changeFile('conflict.js', 'U', { states: ['conflicted'] }),
  ]

  assert.deepEqual(
    Array.from(filterChangeFiles(files, '', 'staged'), (file) => file.path),
    ['staged.js', 'both.js'],
  )
  assert.deepEqual(
    Array.from(filterChangeFiles(files, '', 'unstaged'), (file) => file.path),
    ['both.js'],
  )
  assert.deepEqual(
    Array.from(filterChangeFiles(files, '', 'untracked'), (file) => file.path),
    ['new.js'],
  )
  assert.deepEqual(JSON.parse(JSON.stringify(stateCounts(files))), {
    all: 4,
    staged: 2,
    unstaged: 1,
    untracked: 1,
    conflicted: 1,
  })
})

test('history keys keep repository and branch identities separate', async () => {
  const { branchHistoryKey, commitKey } = await loadClientTestApi()
  assert.notEqual(
    branchHistoryKey('frontend', 'main'),
    branchHistoryKey('backend', 'main'),
  )
  assert.equal(
    commitKey('frontend', 'main', 'abc123'),
    `${branchHistoryKey('frontend', 'main')}\0abc123`,
  )
})

test('hover context shows project and branch without relying on changes', async () => {
  const { hoverRepoContexts } = await loadClientTestApi()
  const contexts = hoverRepoContexts({
    repos: [{
      id: '.',
      name: 'fresh-project',
      relPath: '.',
      branch: 'main',
      detached: false,
      files: [],
      summary: { files: 0 },
    }],
    summary: { files: 0 },
  })

  assert.deepEqual(JSON.parse(JSON.stringify(contexts)), [{
    id: '.',
    name: 'fresh-project',
    branch: 'main',
    detached: false,
    relPath: '.',
  }])
})

test('history baselines are captured once and preserved across refreshes', async () => {
  const { branchHistoryKey, captureHistoryBaselines, isSessionBranch } = await loadClientTestApi()
  const initial = captureHistoryBaselines({}, {
    repos: [
      { id: 'frontend', branches: [{ name: 'main', sha: 'a'.repeat(40) }] },
      { id: 'backend', branches: [{ name: 'main', sha: 'b'.repeat(40) }] },
    ],
  })
  const refreshed = captureHistoryBaselines(initial, {
    repos: [
      { id: 'frontend', branches: [{ name: 'main', sha: 'c'.repeat(40) }] },
      { id: 'backend', branches: [{ name: 'feature', sha: 'd'.repeat(40) }] },
    ],
  })

  assert.equal(refreshed[branchHistoryKey('frontend', 'main')], 'a'.repeat(40))
  assert.equal(refreshed[branchHistoryKey('backend', 'main')], 'b'.repeat(40))
  assert.equal(refreshed[branchHistoryKey('backend', 'feature')], 'd'.repeat(40))

  assert.equal(
    isSessionBranch(refreshed, {
      repoId: 'frontend',
      name: 'main',
      sha: 'a'.repeat(40),
    }),
    false,
  )
  assert.equal(
    isSessionBranch(refreshed, {
      repoId: 'frontend',
      name: 'main',
      sha: 'e'.repeat(40),
    }),
    true,
  )
})
