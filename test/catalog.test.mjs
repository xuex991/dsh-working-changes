import assert from 'node:assert/strict'
import test from 'node:test'
import { buildCatalog, validateCatalog } from '../scripts/sync-plugin-index.mjs'

const sources = [
  {
    name: 'dsh-working-changes',
    title: { en: 'Working Changes', zh: '当前变更' },
    description: { en: 'Changes', zh: '变更' },
    icon: 'icons/working-changes.svg',
    homepage: 'https://github.com/xuex991/dsh-working-changes#readme',
    repository: 'https://github.com/xuex991/dsh-working-changes',
    version: '0.5.3',
    commit: 'a'.repeat(40),
    engines: { dsh: '>=0.2.1-rc.2' },
  },
  {
    name: 'dsh-readable-output',
    title: { en: 'Readable Output', zh: '可读输出' },
    description: { en: 'Output', zh: '输出' },
    icon: 'icons/readable-output.svg',
    homepage: 'https://github.com/xuex991/dsh-readable-output#readme',
    repository: 'https://github.com/xuex991/dsh-readable-output',
    version: '0.1.0',
    commit: 'b'.repeat(40),
    engines: { dsh: '>=0.1.0-rc.6' },
  },
]

test('catalog contains both plugins with independent versions and commits', () => {
  const catalog = validateCatalog(buildCatalog(sources, 1793700000))
  assert.equal(catalog.plugins.length, 2)
  assert.deepEqual(
    catalog.plugins.map((plugin) => [
      plugin.name,
      plugin.versions[0].version,
      plugin.versions[0].source.commit,
    ]),
    [
      ['dsh-working-changes', '0.5.3', 'a'.repeat(40)],
      ['dsh-readable-output', '0.1.0', 'b'.repeat(40)],
    ],
  )
  assert.ok(catalog.plugins.every((plugin) => plugin.versions[0].publishTimestamp === 1793700000))
})

test('catalog validation rejects duplicate plugin names', () => {
  const catalog = buildCatalog(sources, 1793700000)
  catalog.plugins[1].name = catalog.plugins[0].name
  assert.throws(() => validateCatalog(catalog), /Invalid plugin name/)
})
