import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

export const QA_ROOT = resolve(here, '..')
export const PLUGIN_ROOT = process.env.DSH_WC_ROOT
  ? resolve(process.env.DSH_WC_ROOT)
  : resolve(QA_ROOT, '..')
/**
 * 夹具必须落在任何 Git 仓库之外：operations.discoverRepositories 会从 cwd 向上
 * 找 `rev-parse --show-toplevel`，如果夹具在插件仓库里面，一个“容器工作区”
 * 夹具会被误判成“工作区本身就是仓库”，多仓库用例直接失效。
 */
export const FIXTURE_ROOT = process.env.DSH_WC_FIXTURES
  ? resolve(process.env.DSH_WC_FIXTURES)
  : join(tmpdir(), 'dsh-working-changes-qa')
export const REPORT_DIR = join(QA_ROOT, 'report')

export const pluginPath = (...parts) => join(PLUGIN_ROOT, ...parts)
