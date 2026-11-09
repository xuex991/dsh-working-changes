import { assertion, bad, expect, ok } from '../lib/harness.mjs'
import { fixture, operations } from '../lib/cache.mjs'

async function richDiff(ops, cwd, path) {
  const snap = await ops.handle('snapshot', { cwd })
  const repo = snap.repos[0]
  return {
    snap,
    file: snap.files.find((item) => item.path === path) || null,
    diff: await ops.handle('diff', {
      cwd,
      repoRoot: repo.root,
      baselineTree: repo.baselineTree,
      currentTree: repo.currentTree,
      path,
    }),
  }
}

assertion({
  id: 'A1',
  bug: 'B4',
  title: 'diff 不应在末尾多出一条不存在的空上下文行',
  async run() {
    const cwd = await fixture('rich')
    const ops = await operations()
    const { diff } = await richDiff(ops, cwd, 'mod.txt')
    const lines = diff.hunks.flatMap((hunk) => hunk.lines)
    const phantom = lines.filter((line) => line.kind === 'ctx' && line.text === '')
    const expected = [
      { kind: 'ctx', text: 'a' },
      { kind: 'del', text: 'b' },
      { kind: 'add', text: 'B' },
      { kind: 'ctx', text: 'c' },
    ]
    return expect(
      lines.length === expected.length && phantom.length === 0,
      `mod.txt 的 hunk 有 ${lines.length} 行（期望 4），其中空上下文行 ${phantom.length} 条：` +
        JSON.stringify(lines.at(-1)),
      'hunk 行数与文件一致，无尾部空行',
    )
  },
})

assertion({
  id: 'A2',
  bug: 'B4',
  title: 'diff 行号不应越过文件真实行数',
  async run() {
    const cwd = await fixture('rich')
    const ops = await operations()
    const { diff } = await richDiff(ops, cwd, 'mod.txt')
    const maxOld = Math.max(...diff.hunks.flatMap((h) => h.lines.map((l) => l.old ?? 0)))
    const maxNew = Math.max(...diff.hunks.flatMap((h) => h.lines.map((l) => l.new ?? 0)))
    return expect(
      maxOld <= 3 && maxNew <= 3,
      `mod.txt 只有 3 行，但出现 old=${maxOld} / new=${maxNew} 的行号`,
      `行号上界 old=${maxOld} new=${maxNew}，未越界`,
    )
  },
})

assertion({
  id: 'A3',
  bug: 'B9',
  title: '纯重命名文件的 diff 不应变成“新增 +2 −0”',
  async run() {
    const cwd = await fixture('rich')
    const ops = await operations()
    const { file, diff } = await richDiff(ops, cwd, 'new-name.txt')
    return expect(
      diff.additions === 0 && diff.deletions === 0,
      `快照把 new-name.txt 标成 ${file?.status}，但 diff 报 +${diff.additions} −${diff.deletions}`,
      '重命名被识别为纯重命名（0/0）',
    )
  },
})

assertion({
  id: 'A4',
  bug: null,
  title: '未跟踪文件应能出 diff（回归护栏）',
  async run() {
    const cwd = await fixture('rich')
    const ops = await operations()
    const { diff } = await richDiff(ops, cwd, 'untracked.txt')
    return expect(
      diff.additions === 1 && diff.hunks.length === 1,
      `未跟踪文件 diff 异常：${JSON.stringify({ additions: diff.additions, hunks: diff.hunks.length })}`,
      '未跟踪文件按新增渲染',
    )
  },
})

assertion({
  id: 'A5',
  bug: null,
  title: '二进制文件应标记 binary 且不产出 hunk（回归护栏）',
  async run() {
    const cwd = await fixture('rich')
    const ops = await operations()
    const { diff } = await richDiff(ops, cwd, 'bin.dat')
    return expect(
      diff.binary === true && diff.hunks.length === 0,
      `二进制 diff 异常：binary=${diff.binary} hunks=${diff.hunks.length}`,
      '二进制文件只标记不渲染',
    )
  },
})
