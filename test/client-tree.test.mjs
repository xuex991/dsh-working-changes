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
