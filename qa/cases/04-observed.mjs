import { readFile } from 'node:fs/promises'
import { metric, observe } from '../lib/harness.mjs'
import { fixture, operations } from '../lib/cache.mjs'
import { pluginPath } from '../lib/env.mjs'

metric({
  id: 'M1',
  bug: 'B5',
  title: '富场景仓库（约 70 个变更文件）单次快照耗时与 git 调用分布',
  async run() {
    const cwd = await fixture('rich')
    const trace = []
    const ops = await operations(trace)
    const started = Date.now()
    const snap = await ops.handle('snapshot', { cwd })
    const total = Date.now() - started
    const add = trace.find((item) => item.argv.startsWith('add '))
    return {
      value: total,
      unit: 'ms',
      detail: [
        `${snap.files.length} 个变更文件，总耗时 ${total}ms，${trace.length} 次 git 调用`,
        ...trace.map((item) => `  ${String(item.ms).padStart(5)}ms  git ${item.argv.slice(0, 80)}`),
        add ? `  → add --all 占 ${Math.round((add.ms / total) * 100)}%` : '',
      ].filter(Boolean),
    }
  },
})

metric({
  id: 'M2',
  bug: 'B5',
  title: '大仓库（300 修改 + 3000 未跟踪）首/次快照耗时与响应体积',
  async run() {
    const cwd = await fixture('big')
    const ops = await operations()
    const t0 = Date.now()
    const first = await ops.handle('snapshot', { cwd })
    const firstMs = Date.now() - t0
    const t1 = Date.now()
    await ops.handle('snapshot', { cwd })
    const secondMs = Date.now() - t1
    const bytes = Buffer.byteLength(JSON.stringify(first))
    return {
      value: firstMs,
      unit: 'ms',
      detail: [
        `首次 ${firstMs}ms，第二次（无写入变化）${secondMs}ms`,
        `${first.files.length} 个变更文件，snapshot JSON ${(bytes / 1024).toFixed(0)} KB`,
        secondMs > 300
          ? '无变化时仍要重跑 add --all，所以“廉价轮询”目前不可行（见 B5/B15）'
          : '无变化时开销可接受',
      ],
    }
  },
})

metric({
  id: 'M3',
  bug: 'B5',
  title: '完全没有变化时，第二次快照的时间花在哪',
  async run() {
    const cwd = await fixture('big')
    await (await operations()).handle('snapshot', { cwd })
    const trace = []
    const ops = await operations(trace)
    const started = Date.now()
    await ops.handle('snapshot', { cwd })
    const total = Date.now() - started
    const sum = trace.reduce((acc, item) => acc + item.ms, 0)
    const add = trace.find((item) => item.argv.startsWith('add '))?.ms || 0
    const numstat = trace.find((item) => item.argv.startsWith('diff --numstat'))?.ms || 0
    return {
      value: Math.round((add / Math.max(sum, 1)) * 100),
      unit: '%',
      detail: [
        `无变化时仍耗时 ${total}ms（git 调用合计 ${sum}ms，部分并发）`,
        `add --all ${add}ms · numstat ${numstat}ms`,
        `add 占 ${Math.round((add / Math.max(sum, 1)) * 100)}% —— 这部分在“什么都没改”时纯属浪费`,
      ],
    }
  },
})

observe({
  id: 'O1',
  bug: 'B1',
  title: 'refresh() 的全部触发点（当前只有 3 个）',
  async run() {
    const source = await readFile(pluginPath('lib/client.js'), 'utf8')
    const lines = source.split('\n')
    const hits = []
    lines.forEach((line, index) => {
      if (!/refresh\(\)|addEventListener\('focus'/.test(line)) return
      const lineNo = index + 1
      if (lineNo < 1300 || lineNo > 1800) return
      hits.push(`lib/client.js:${lineNo}  ${line.trim()}`)
    })
    return {
      detail: [
        '触发点：① running→idle 边沿（180ms 去抖）② window focus ③ 手动刷新/点顶部 pill',
        '缺失：回合进行中的任何事件、面板重新可见、定时轮询',
        ...hits,
      ],
    }
  },
})

observe({
  id: 'O2',
  bug: 'B10',
  title: '版本选择器打开即对全部分支并发 loadCommits',
  async run() {
    const source = await readFile(pluginPath('lib/client.js'), 'utf8')
    const lines = source.split('\n')
    const excerpt = lines.slice(2229, 2241).map((line, index) => `${2230 + index}  ${line}`)
    return {
      detail: ['打开下拉时对 history.repos[i].branches 全量遍历调用 loadCommits（上限 200 分支/仓库）：', ...excerpt],
    }
  },
})

observe({
  id: 'O3',
  bug: 'B12',
  title: '刷新历史时无条件清空 branchCommits',
  async run() {
    const source = await readFile(pluginPath('lib/client.js'), 'utf8')
    const lines = source.split('\n')
    return {
      detail: [
        'lib/client.js:1434  branchCommits: {}',
        '每次 refresh → loadHistory 都会丢弃已加载的分支提交，历史下拉里的展开项需要重新转圈。',
      ],
    }
  },
})

observe({
  id: 'O4',
  bug: 'B11',
  title: '历史基线在“首次 loadHistory”时记录，取决于面板何时被打开',
  async run() {
    const source = await readFile(pluginPath('lib/client.js'), 'utf8')
    const lines = source.split('\n')
    return {
      detail: [
        'lib/client.js:1122-1131  if (branch.sha && !Object.hasOwn(next, key)) next[key] = branch.sha',
        'lib/client.js:1423-1427  loadHistory 内才调用 captureHistoryBaselines + 写 sessionStorage',
        '推论：如果这一轮工作开始时面板没打开过，基线会记在提交之后 → 本 Session 提交列表为空。',
        'sessionStorage key 含 sessionId + cwd，页面重载可延续；但同一 session 内首次打开过晚无法补救。',
      ],
    }
  },
})

observe({
  id: 'O5',
  bug: 'B16',
  title: '刷新时保留旧 diff，且没有“数据年龄”提示',
  async run() {
    const source = await readFile(pluginPath('lib/client.js'), 'utf8')
    return {
      detail: [
        'lib/client.js:1386-1394 刷新成功后 diff: selectedFile ? store.get().diff : null —— 新树配旧 diff，直到异步 loadDiff 返回',
        'lib/client.js:2965-2967 副标题渲染 baseline.tree.slice(0,7)，没有时间信息；真正的 capturedAt 未使用',
        '结论：用户既无法判断数据新旧，刷新瞬间还可能看到错配的 diff。',
      ],
    }
  },
})
