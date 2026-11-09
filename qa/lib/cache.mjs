import { pluginPath } from './env.mjs'
import { makeExec } from './exec.mjs'
import * as fixtures from './fixtures.mjs'

const built = new Map()
const builders = {
  rich: fixtures.buildRich,
  unborn: fixtures.buildUnborn,
  multi: fixtures.buildMulti,
  subdir: fixtures.buildSubdir,
  conflict: fixtures.buildConflict,
  big: fixtures.buildBig,
  'rename-edit': fixtures.buildRenameEdit,
}

export async function fixture(name) {
  if (!built.has(name)) built.set(name, await builders[name]())
  return built.get(name)
}

export async function operations(trace = null) {
  const { createOperations } = await import(`file://${pluginPath('src/operations.js')}`)
  const exec = makeExec()
  return createOperations({
    exec: trace
      ? async (argv, options) => {
          const started = Date.now()
          const result = await exec(argv, options)
          trace.push({ argv: argv.slice(1).join(' '), ms: Date.now() - started, code: result.code })
          return result
        }
      : exec,
  })
}
