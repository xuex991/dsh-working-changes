#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import process from 'node:process'

import { FIXTURE_ROOT, QA_ROOT, PLUGIN_ROOT, REPORT_DIR } from './lib/env.mjs'
import { asserts, metrics, observations } from './lib/harness.mjs'
import { BUGS } from './bugs.mjs'

import './cases/01-diff.mjs'
import './cases/02-snapshot.mjs'
import './cases/03-client.mjs'
import './cases/04-observed.mjs'

const only = process.argv.find((arg) => arg.startsWith('--only='))?.slice(7)
const skipPerf = process.argv.includes('--no-perf')

const started = Date.now()

function readVersion() {
  try {
    const raw = execFileSync('git', ['-C', PLUGIN_ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' })
    return raw.trim()
  } catch {
    return '(no git)'
  }
}

function assertFixturesOutsideGit() {
  try {
    const toplevel = execFileSync('git', ['-C', FIXTURE_ROOT, 'rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    throw new Error(
      `夹具目录 ${FIXTURE_ROOT} 位于 Git 仓库 ${toplevel} 内。` +
        'operations 会从 cwd 向上解析仓库根，容器型夹具（multi）会被误判成单仓库。' +
        '请用 DSH_WC_FIXTURES 指到任意仓库之外。',
    )
  } catch (error) {
    if (error?.message?.startsWith('夹具目录')) throw error
    // git 失败 = 不在仓库里，正是期望状态
  }
}

async function main() {
  assertFixturesOutsideGit()
  const results = []
  for (const item of asserts) {
    if (only && item.id !== only) continue
    const begin = Date.now()
    let outcome
    try {
      outcome = await item.run()
    } catch (error) {
      outcome = { ok: false, detail: `用例抛出异常：${error?.stack || error}` }
    }
    results.push({ ...item, ...outcome, ms: Date.now() - begin })
    const mark = outcome.ok ? 'PASS' : 'FAIL'
    console.log(`[${mark}] ${item.id} ${item.title}${outcome.ok ? '' : `\n        ↳ ${String(outcome.detail).split('\n')[0]}`}`)
  }

  const metricResults = []
  if (!skipPerf) {
    for (const item of metrics) {
      if (only && item.id !== only) continue
      const begin = Date.now()
      try {
        metricResults.push({ ...item, ...(await item.run()), ms: Date.now() - begin })
      } catch (error) {
        metricResults.push({ ...item, value: 'ERR', unit: '', detail: String(error?.message || error), ms: Date.now() - begin })
      }
    }
  }

  const observeResults = []
  for (const item of observations) {
    if (only && item.id !== only) continue
    try {
      observeResults.push({ ...item, ...(await item.run()) })
    } catch (error) {
      observeResults.push({ ...item, detail: String(error?.message || error) })
    }
  }

  const meta = {
    ranAt: new Date(),
    durationMs: Date.now() - started,
    pluginVersion: JSON.parse(await (await import('node:fs/promises')).readFile(join(PLUGIN_ROOT, 'package.json'), 'utf8')).version,
    pluginHead: readVersion(),
    node: process.version,
    platform: `${process.platform} ${process.arch}`,
    root: PLUGIN_ROOT,
  }

  await mkdir(REPORT_DIR, { recursive: true })
  await writeFile(join(REPORT_DIR, 'report.json'), JSON.stringify({ meta, results, metricResults, observeResults, bugs: BUGS }, null, 2))
  await writeFile(join(REPORT_DIR, 'report.html'), renderHtml({ meta, results, metricResults, observeResults }), 'utf8')
  await writeFile(join(QA_ROOT, 'BUGS.md'), renderMarkdown({ meta, results }), 'utf8')

  const failed = results.filter((item) => !item.ok)
  console.log(`\n${results.length - failed.length}/${results.length} 断言通过，${failed.length} 条失败`)
  if (failed.length > 0) console.log(`失败用例：${failed.map((item) => `${item.id}(${item.bug})`).join(', ')}`)
  console.log(`报告：${join(REPORT_DIR, 'report.html')}`)
  console.log(`清单：${join(QA_ROOT, 'BUGS.md')}`)
}

function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function severityClass(severity) {
  return `sev-${severity.toLowerCase()}`
}

function renderHtml({ meta, results, metricResults, observeResults }) {
  const failed = results.filter((item) => !item.ok)
  const byBug = new Map()
  for (const item of results) {
    if (!item.bug) continue
    if (!byBug.has(item.bug)) byBug.set(item.bug, [])
    byBug.get(item.bug).push(item)
  }
  const confirmed = BUGS.filter((bug) => !bug.fixed && (byBug.get(bug.id) || []).some((item) => !item.ok))
  const fixedCount = BUGS.filter((bug) => bug.fixed).length
  const guarded = BUGS.filter((bug) => {
    const list = byBug.get(bug.id) || []
    return list.length > 0 && list.every((item) => item.ok)
  })

  const bugRows = BUGS.map((bug) => {
    const list = byBug.get(bug.id) || []
    const status = bug.fixed
      ? '<span class="pill pill-fixed">已修复</span>'
      : list.length === 0
        ? '<span class="pill pill-muted">仅代码证据</span>'
        : list.every((item) => item.ok)
          ? '<span class="pill pill-ok">未复现</span>'
          : '<span class="pill pill-bad">已复现</span>'
    return `<tr>
      <td><code>${esc(bug.id)}</code></td>
      <td><span class="sev ${severityClass(bug.severity)}">${esc(bug.severity)}</span></td>
      <td>${esc(bug.area)}</td>
      <td>${esc(bug.title)}</td>
      <td>${list.map((item) => `<code>${esc(item.id)}</code>`).join(' ') || '—'}</td>
      <td>${status}</td>
    </tr>`
  }).join('\n')

  const assertCards = results.map((item) => `
    <article class="card ${item.ok ? 'card-ok' : 'card-bad'}">
      <header>
        <span class="card-id">${esc(item.id)}</span>
        <h3>${esc(item.title)}</h3>
        <span class="pill ${item.ok ? 'pill-ok' : 'pill-bad'}">${item.ok ? 'PASS' : 'FAIL'}</span>
        ${item.bug ? `<span class="card-bug">${esc(item.bug)}</span>` : '<span class="card-bug card-bug-none">护栏</span>'}
        <span class="card-ms">${item.ms} ms</span>
      </header>
      <pre>${esc(item.detail)}</pre>
    </article>`).join('\n')

  const metricCards = metricResults.map((item) => `
    <article class="card">
      <header>
        <span class="card-id">${esc(item.id)}</span>
        <h3>${esc(item.title)}</h3>
        <span class="metric-value">${esc(item.value)}<small>${esc(item.unit)}</small></span>
        ${item.bug ? `<span class="card-bug">${esc(item.bug)}</span>` : ''}
      </header>
      <pre>${esc(Array.isArray(item.detail) ? item.detail.join('\n') : item.detail)}</pre>
    </article>`).join('\n')

  const observeCards = observeResults.map((item) => `
    <article class="card card-observe">
      <header>
        <span class="card-id">${esc(item.id)}</span>
        <h3>${esc(item.title)}</h3>
        ${item.bug ? `<span class="card-bug">${esc(item.bug)}</span>` : ''}
      </header>
      <pre>${esc(Array.isArray(item.detail) ? item.detail.join('\n') : item.detail)}</pre>
    </article>`).join('\n')

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Working Changes · QA 报告</title>
<style>
  :root {
    --bg: #f6f7f9; --card: #fff; --ink: #101828; --muted: #667085; --line: #e4e7ec;
    --ok: #067647; --ok-bg: #ecfdf3; --bad: #b42318; --bad-bg: #fef3f2;
    --p0: #b42318; --p1: #b54708; --p2: #175cd3; --p3: #475467;
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px 28px 64px; background: var(--bg); color: var(--ink);
    font: 14px/1.6 -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif; }
  .wrap { max-width: 1120px; margin: 0 auto; }
  h1 { font-size: 22px; margin: 0 0 6px; letter-spacing: -0.01em; }
  .sub { color: var(--muted); font-size: 13px; }
  .sub code { background: #eef1f5; padding: 1px 5px; border-radius: 4px; }
  .stats { display: flex; gap: 12px; margin: 20px 0 28px; flex-wrap: wrap; }
  .stat { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 12px 16px; min-width: 120px; }
  .stat b { display: block; font-size: 22px; line-height: 1.2; }
  .stat span { color: var(--muted); font-size: 12px; }
  .stat.bad b { color: var(--bad); } .stat.ok b { color: var(--ok); }
  h2 { font-size: 16px; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 1px solid var(--line); }
  h2 small { color: var(--muted); font-weight: 400; margin-left: 8px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; background: var(--card); border: 1px solid var(--line);
    border-radius: 10px; overflow: hidden; font-size: 13px; }
  th, td { text-align: left; padding: 9px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { background: #f9fafb; font-weight: 600; color: var(--muted); font-size: 12px; }
  tr:last-child td { border-bottom: 0; }
  code { font: 12px/1.5 ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace; }
  .sev { display: inline-block; padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; color: #fff; }
  .sev-p0 { background: var(--p0); } .sev-p1 { background: var(--p1); }
  .sev-p2 { background: var(--p2); } .sev-p3 { background: var(--p3); }
  .pill { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
  .pill-ok { background: var(--ok-bg); color: var(--ok); }
  .pill-bad { background: var(--bad-bg); color: var(--bad); }
  .pill-muted { background: #f2f4f7; color: var(--muted); }
  .pill-fixed { background: #eef4ff; color: #175cd3; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; }
  .card-bad { border-left: 3px solid var(--bad); }
  .card-ok { border-left: 3px solid var(--ok); }
  .card-observe { border-left: 3px solid #d0d5dd; }
  .card header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .card h3 { font-size: 14px; margin: 0; font-weight: 600; flex: 1 1 320px; }
  .card-id { font: 700 12px ui-monospace, monospace; color: var(--muted); }
  .card-bug { font: 700 11px ui-monospace, monospace; color: var(--muted); background: #f2f4f7; padding: 1px 6px; border-radius: 4px; }
  .card-bug-none { opacity: .5; }
  .card-ms { color: var(--muted); font-size: 11px; }
  .metric-value { font-size: 18px; font-weight: 700; }
  .metric-value small { font-size: 11px; color: var(--muted); margin-left: 2px; }
  pre { margin: 10px 0 0; padding: 10px 12px; background: #fbfcfd; border: 1px solid var(--line);
    border-radius: 8px; white-space: pre-wrap; word-break: break-word; font: 12px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace;
    color: #344054; max-height: 420px; overflow: auto; }
  .foot { margin-top: 36px; color: var(--muted); font-size: 12px; }
  .foot code { background: #eef1f5; padding: 1px 5px; border-radius: 4px; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Working Changes · QA 报告</h1>
  <div class="sub">
    插件 <code>dsh-working-changes@${esc(meta.pluginVersion)}</code> ·
    HEAD <code>${esc(meta.pluginHead)}</code> ·
    ${esc(meta.ranAt.toLocaleString('zh-CN'))} · ${esc(meta.platform)} · node ${esc(meta.node)} ·
    用时 ${(meta.durationMs / 1000).toFixed(1)}s ·
    <code>${esc(meta.root)}</code>
  </div>

  <div class="stats">
    <div class="stat ${failed.length ? 'bad' : 'ok'}"><b>${results.length - failed.length}/${results.length}</b><span>断言通过</span></div>
    <div class="stat bad"><b>${confirmed.length}</b><span>已复现 bug</span></div>
    <div class="stat"><b>${BUGS.length}</b><span>清单条目</span></div>
    <div class="stat"><b>${fixedCount}</b><span>本轮已修复</span></div>
  </div>

  <h2>Bug 清单 <small>清单全量在 qa/BUGS.md，“已复现”表示本次有用例失败</small></h2>
  <table>
    <thead><tr><th>ID</th><th>级别</th><th>模块</th><th>问题</th><th>用例</th><th>状态</th></tr></thead>
    <tbody>${bugRows}</tbody>
  </table>

  <h2>断言用例 <small>失败 = 问题此刻可复现；护栏用例用来防止回归</small></h2>
  ${assertCards}

  <h2>度量 <small>数值随机器变化，关注量级与占比</small></h2>
  ${metricCards || '<div class="card">跳过（--no-perf）</div>'}

  <h2>代码观测 <small>客户端行为无法在 Node 里跑，这里给出触发点与关键代码</small></h2>
  ${observeCards}

  <div class="foot">
    重新生成：<code>node qa/run.mjs</code>（跳过度量：<code>node qa/run.mjs --no-perf</code>）·
    只跑一条：<code>node qa/run.mjs --only=A1</code> ·
    报告同时写入 <code>qa/report/report.json</code>
  </div>
</div>
</body>
</html>
`
}

function renderMarkdown({ meta, results }) {
  const byBug = new Map()
  for (const item of results) {
    if (!item.bug) continue
    if (!byBug.has(item.bug)) byBug.set(item.bug, [])
    byBug.get(item.bug).push(item)
  }
  const counts = { P0: 0, P1: 0, P2: 0, P3: 0 }
  for (const bug of BUGS) counts[bug.severity] += 1

  const lines = []
  lines.push('# Working Changes · Bug 清单（收敛版）')
  lines.push('')
  lines.push('> 本文件由 `qa/run.mjs` 生成，数据源是 `qa/bugs.mjs`；改清单请改 `qa/bugs.mjs` 再重跑。')
  lines.push('')
  lines.push(`- 插件版本：\`dsh-working-changes@${meta.pluginVersion}\`（HEAD \`${meta.pluginHead}\`）`)
  lines.push(`- 生成时间：${meta.ranAt.toLocaleString('zh-CN')}`)
  lines.push(`- 断言：${results.filter((item) => item.ok).length}/${results.length} 通过`)
  lines.push(`- 条目：${BUGS.length} 条（P0 ${counts.P0} · P1 ${counts.P1} · P2 ${counts.P2} · P3 ${counts.P3}）`)
  lines.push('')
  lines.push('## 一览')
  lines.push('')
  lines.push('| ID | 级别 | 模块 | 问题 | 用例 | 当前 |')
  lines.push('|---|---|---|---|---|---|')
  for (const bug of BUGS) {
    const list = byBug.get(bug.id) || []
    const state = bug.fixed
      ? '已修复'
      : list.length === 0
        ? '代码证据'
        : list.every((item) => item.ok) ? '已通过' : '**已复现**'
    lines.push(`| [${bug.id}](#${bug.id.toLowerCase()}) | ${bug.severity} | ${bug.area} | ${bug.title} | ${list.map((item) => item.id).join(' ') || '—'} | ${state} |`)
  }
  lines.push('')

  const order = { P0: 0, P1: 1, P2: 2, P3: 3 }
  const sorted = [...BUGS].sort((left, right) => order[left.severity] - order[right.severity])
  for (const bug of sorted) {
    const list = byBug.get(bug.id) || []
    lines.push(`## ${bug.id}`)
    lines.push('')
    lines.push(`**${bug.title}**`)
    lines.push('')
    lines.push(`- 级别：${bug.severity} · 模块：${bug.area}`)
    lines.push(`- 对应用例：${list.map((item) => `\`${item.id}\` ${item.ok ? '（当前通过）' : '（当前失败）'}`).join('、') || '—'}`)
    lines.push('')
    lines.push(`**现象**：${bug.symptom}`)
    lines.push('')
    lines.push(`**成因**：${bug.cause}`)
    lines.push('')
    lines.push('**证据**：')
    for (const item of bug.evidence) lines.push(`- ${item}`)
    lines.push('')
    lines.push(`**修复方向**：${bug.fix}`)
    lines.push('')
    if (bug.fixed) {
      lines.push(`**状态**：${bug.fixed}`)
      lines.push('')
    }
  }

  lines.push('## 建议修复顺序')
  lines.push('')
  lines.push('1. **B5 + B15 → B1**：先把“取数”变便宜（status 快速路径 + 摘要 op），再打开轮询；顺序反过来会把 CPU 打满。')
  lines.push('2. **B2**：session watch 不能一次性安装，这是“有的 session 永远不刷新”的根因，改动小、收益直接。')
  lines.push('3. **B4**：diff 尾部幻影行，一行修复 + 现有用例锁死，顺手把 diff 视图的可信度拉回来。')
  lines.push('4. **B3 / B16**：可见即新鲜、diff 与快照同版本，属于同一族“陈旧数据”问题，一起做。')
  lines.push('5. **B6**：超时层级拧过来，让大仓库的失败可诊断。')
  lines.push('6. **B7 / B8 / B9 / B13**：低成本清理，可与上面同批。')
  lines.push('7. **B10 / B11 / B12**：历史模块的性能与基线语义，建议单独一轮。')
  lines.push('')
  lines.push('## 已确认正常（回归护栏）')
  lines.push('')
  for (const item of results.filter((entry) => !entry.bug)) {
    lines.push(`- \`${item.id}\` ${item.title} — ${item.ok ? '通过' : '**失败，需要处理**'}`)
  }
  lines.push('')
  lines.push('## 怎么跑')
  lines.push('')
  lines.push('```bash')
  lines.push('node qa/run.mjs            # 全量：造夹具 → 断言 → 度量 → 写 report/report.html + BUGS.md')
  lines.push('node qa/run.mjs --no-perf  # 跳过耗时度量（大仓库夹具）')
  lines.push('node qa/run.mjs --only=A1  # 只跑一条用例')
  lines.push('```')
  lines.push('')
  lines.push('夹具落在 `qa/.fixtures/`（已 gitignore），每次运行重建。')
  lines.push('')
  return lines.join('\n')
}

await main()
