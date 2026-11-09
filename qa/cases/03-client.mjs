import { readFile } from 'node:fs/promises'
import { assertion } from '../lib/harness.mjs'
import { pluginPath } from '../lib/env.mjs'
import { extractFunction } from '../lib/source.mjs'

async function clientSource() {
  return readFile(pluginPath('lib/client.js'), 'utf8')
}

async function operationsSource() {
  return readFile(pluginPath('src/operations.js'), 'utf8')
}

const block = extractFunction

assertion({
  id: 'A13',
  bug: 'B1',
  title: '面板应有“回合进行中也能自己变新”的机制（定时/订阅），而不是只靠回合结束',
  async run() {
    const source = await clientSource()
    const hasTimer = /setInterval\s*\(/.test(source)
    const hasWatch = /(chokidar|fs\.watch|watchFile)/.test(source)
    return {
      ok: hasTimer || hasWatch,
      detail: hasTimer || hasWatch
        ? '存在周期性刷新机制'
        : 'lib/client.js 里没有任何 setInterval/文件监听：刷新只在 running→idle、window focus、手动点击三处发生，' +
          '一轮 Agent 跑几分钟期间面板不会变。',
    }
  },
})

assertion({
  id: 'A14',
  bug: 'B2',
  title: 'session watch 安装失败时不应永久放弃',
  async run() {
    const source = await clientSource()
    const install = extractFunction(source, 'installSessionWatch')
    if (!install) return { ok: false, detail: '找不到 installSessionWatch()，刷新契约已变更，请人工复核' }
    const givesUp = /if \(!source\) return/.test(install) || /if \(!binding\) return/.test(install)
    return {
      ok: !givesUp,
      detail: givesUp
        ? 'installSessionWatch() 里 binding/session 取不到就 return，而它只在 watchers 0→1 时被调用一次；' +
          '新建 session 首帧通常还不在 host 列表（runtime 的 eligible 为假），此后整个 session 都不会自动刷新。'
        : '安装失败后有重试/等待路径',
    }
  },
})

assertion({
  id: 'A15',
  bug: 'B3',
  title: '面板变为可见（含重新打开 tab）时应触发一次取数',
  async run() {
    const source = await clientSource()
    const watch = extractFunction(source, 'watch')
    if (!watch) return { ok: false, detail: '找不到 watch()，刷新契约已变更，请人工复核' }
    // 只看 watch() 本身：installSessionWatch 里的 void refresh() 是“回合结束”那条路径，
    // 面板重新可见时不经过它。
    const refreshes = /^\s*(void\s+)?refresh\(\)\s*$/m.test(watch)
    return {
      ok: refreshes,
      detail: refreshes
        ? '可见时会取数'
        : 'watch() 0→1 安装路径里没有 refresh：从侧栏 tab 重新打开（非顶部 pill）会直接展示关闭前的旧数据。',
    }
  },
})

assertion({
  id: 'A18',
  bug: 'B8',
  title: 'createStore 不应保留永不成立的短路判断',
  async run() {
    const source = await clientSource()
    const store = extractFunction(source, 'createStore')
    const dead = /merged === state/.test(store)
    return {
      ok: !dead,
      detail: dead
        ? 'createStore.set 里 merged 是 {...state, ...patch} 新对象，`merged === state` 恒为假，每次 set 都会通知订阅者；' +
          '轮询改造后这会变成每 2 秒一次全量重渲染。'
        : 'set 有真实的相等短路',
    }
  },
})

assertion({
  id: 'A16',
  bug: 'B6',
  title: '内层 add 超时必须小于仓库级超时',
  async run() {
    const source = await operationsSource()
    const repoTimeout = Number(/const REPO_TIMEOUT = (\d+)/.exec(source)?.[1] ?? NaN)
    const capture = extractFunction(source, 'captureWorkingTree')
    const addTimeout = Number(/timeoutMs:\s*(\d+)/.exec(capture)?.[1] ?? NaN)
    if (!Number.isFinite(repoTimeout) || !Number.isFinite(addTimeout)) {
      return { ok: false, detail: '超时常量解析失败，请人工复核 captureWorkingTree 的 timeoutMs' }
    }
    return {
      ok: addTimeout < repoTimeout,
      detail: addTimeout < repoTimeout
        ? `add 超时 ${addTimeout}ms < 仓库超时 ${repoTimeout}ms`
        : `captureWorkingTree 的 add 超时 ${addTimeout}ms 大于仓库级超时 ${repoTimeout}ms：` +
          '大仓库只会得到一条笼统的 “timed out after 15000ms”，内层 120s 永远等不到。',
    }
  },
})
