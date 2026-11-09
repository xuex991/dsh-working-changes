import { assertion, bad, expect, ok } from '../lib/harness.mjs'
import { fixture, operations } from '../lib/cache.mjs'

assertion({
  id: 'A6',
  bug: null,
  title: '富场景仓库：变更类型、状态、未跟踪目录都齐全（回归护栏）',
  async run() {
    const cwd = await fixture('rich')
    const ops = await operations()
    const snap = await ops.handle('snapshot', { cwd })
    const byPath = new Map(snap.files.map((file) => [file.path, file]))
    const problems = []
    const want = (path, predicate, label) => {
      const file = byPath.get(path)
      if (!file) problems.push(`缺少 ${path}`)
      else if (!predicate(file)) problems.push(`${path} 不满足 ${label}：${JSON.stringify(file)}`)
    }
    want('mod.txt', (f) => f.status === 'M' && f.states.includes('unstaged'), 'M/unstaged')
    want('staged-new.txt', (f) => f.status === 'A' && f.states.includes('staged'), 'A/staged')
    want('untracked.txt', (f) => f.status === 'A' && f.states.includes('untracked'), 'A/untracked')
    want('del.txt', (f) => f.status === 'D', 'D')
    want('new-name.txt', (f) => f.status === 'R' && f.oldPath === 'old-name.txt', 'R + oldPath')
    want('bin.dat', (f) => f.binary === true, 'binary')
    want('gen/n0.txt', (f) => f.states.includes('untracked'), '深层未跟踪文件')
    want('docs/中文.md', (f) => f.path === 'docs/中文.md', '中文路径')
    want('docs/a b/space file.md', (f) => f.status === 'M', '带空格路径')
    const summaryOk = snap.summary.files === snap.files.length && snap.summary.binary === 1
    if (!summaryOk) problems.push(`summary 不一致：${JSON.stringify(snap.summary)}`)
    return expect(
      problems.length === 0,
      problems.join('\n'),
      `${snap.files.length} 个文件，状态/重命名/二进制/中文/空格路径全部正确`,
    )
  },
})

assertion({
  id: 'A7',
  bug: 'B14',
  title: '冲突文件应保留 staged/unstaged 维度（或明确只标 conflicted）',
  async run() {
    const cwd = await fixture('conflict')
    const ops = await operations()
    const snap = await ops.handle('snapshot', { cwd })
    const file = snap.files.find((item) => item.path === 'conf.txt')
    if (!file) return bad('合并冲突仓库里没找到 conf.txt')
    return expect(
      file.states.length > 1,
      `冲突文件 states=${JSON.stringify(file.states)}，stageStatus=${file.stageStatus} worktreeStatus=${file.worktreeStatus}：` +
        'XY 两位都被压平成单一状态，已暂存/未暂存筛选会漏掉它',
      `冲突文件 states=${JSON.stringify(file.states)}`,
    )
  },
})

assertion({
  id: 'A8',
  bug: null,
  title: '无提交仓库（unborn HEAD）应正常出快照（回归护栏）',
  async run() {
    const cwd = await fixture('unborn')
    const ops = await operations()
    const snap = await ops.handle('snapshot', { cwd })
    return expect(
      snap.workspace.status === 'changes' &&
        snap.repos[0]?.branch === 'main' &&
        snap.files.length === 2 &&
        snap.repos[0]?.error === null,
      `unborn 快照异常：${JSON.stringify({ status: snap.workspace.status, repos: snap.repos.map((r) => ({ b: r.branch, e: r.error, f: r.files.length })) })}`,
      '无提交仓库按全新增处理，分支名可用',
    )
  },
})

assertion({
  id: 'A9',
  bug: null,
  title: '多仓库工作区：发现、仓库名去歧义、路径前缀（回归护栏）',
  async run() {
    const cwd = await fixture('multi')
    const ops = await operations()
    const snap = await ops.handle('snapshot', { cwd })
    const repos = snap.repos.map((repo) => repo.relPath).sort()
    const prefixed = snap.files.every((file) => file.relPath.startsWith(`${file.repoId}/`))
    return expect(
      snap.workspace.multiRepo === true &&
        repos.length === 2 &&
        repos[0] === 'r1' &&
        prefixed &&
        snap.files.length === 4,
      `多仓库发现异常：repos=${JSON.stringify(repos)} multiRepo=${snap.workspace.multiRepo} files=${snap.files.length} prefixed=${prefixed}`,
      `发现 ${repos.length} 个仓库、${snap.files.length} 个文件，路径带仓库前缀`,
    )
  },
})

assertion({
  id: 'A10',
  bug: null,
  title: '工作区是仓库子目录时，快照覆盖整仓库（记录现状）',
  async run() {
    const cwd = await fixture('subdir')
    const ops = await operations()
    const snap = await ops.handle('snapshot', { cwd })
    const file = snap.files[0]
    return expect(
      Boolean(file) && file.path === 'packages/app/a.txt' && snap.repos[0].relPath === '.',
      `子目录工作区异常：${JSON.stringify(snap.files.map((f) => f.path))}`,
      '仓库根为基准，文件路径为仓库相对路径',
    )
  },
})

assertion({
  id: 'A17',
  bug: 'B7',
  title: 'snapshot 的 captured 字段应表达真实状态',
  async run() {
    const cwd = await fixture('rich')
    const ops = await operations()
    const snap = await ops.handle('snapshot', { cwd })
    return expect(
      snap.captured === true,
      `有 ${snap.files.length} 个变更，但 snapshot.captured=${JSON.stringify(snap.captured)}，` +
        '客户端据此选择的空状态提示分支永远走不到',
      'captured 为真',
    )
  },
})

assertion({
  id: 'A11',
  bug: 'B5',
  title: '仓库没有变化时，第二次快照不应再跑 git add --all',
  async run() {
    const cwd = await fixture('rich')
    const trace = []
    const ops = await operations(trace)
    await ops.handle('snapshot', { cwd })
    const firstAdds = trace.filter((item) => item.argv.startsWith('add ')).length
    trace.length = 0
    const started = Date.now()
    await ops.handle('snapshot', { cwd })
    const secondMs = Date.now() - started
    const secondAdds = trace.filter((item) => item.argv.startsWith('add ')).length
    return expect(
      secondAdds === 0,
      `两次快照都跑了 add --all（第一次 ${firstAdds} 次，第二次 ${secondAdds} 次，第二次耗时 ${secondMs}ms）；` +
        '内容没变却仍全量重哈希，这是无法做廉价轮询的直接原因',
      `第二次未再执行 add --all（${secondMs}ms）`,
    )
  },
})

assertion({
  id: 'A19',
  bug: 'B17',
  title: '「重命名 + 改内容」应是一条 R，而不是拆成 D + A 两条',
  async run() {
    const cwd = await fixture('rename-edit')
    const ops = await operations()
    const snap = await ops.handle('snapshot', { cwd })
    const paths = snap.files.map((file) => `${file.status} ${file.path}`)
    const renames = snap.files.filter((file) => file.status === 'R')
    const ghosts = snap.files.filter(
      (file) => file.path === 'src/report_daily.py' || file.path === 'src/report_daily_v2.py',
    )
    const statusSaysRename = /^RM|^R./m.test(
      (await import('node:child_process')).execFileSync(
        'git', ['-C', cwd, 'status', '--porcelain=v1'], { encoding: 'utf8' },
      ),
    )
    return expect(
      renames.length === 1 && ghosts.length === 1 && statusSaysRename,
      `git status 记作 R（重命名 + 改内容），但快照给出 ${ghosts.length} 条：${JSON.stringify(paths)}；` +
        `被拆出的 D 行还会因为状态查不到而标成「未暂存」。`,
      '重命名合并为一条 R，并带上原路径',
    )
  },
})
