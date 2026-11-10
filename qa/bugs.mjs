/**
 * 单一事实来源：本文件的 bug 清单同时驱动 BUGS.md 与 report.html。
 * 严重度：P0 数据/行为明显错误且高频；P1 明显错误的边缘路径或体验硬伤；
 *         P2 质感问题；P3 打磨项。
 */
export const BUGS = [
  {
    id: 'B1',
    severity: 'P0',
    area: '刷新时机',
    title: 'Agent 回合进行中面板完全冻结，没有任何自动更新',
    symptom:
      '一轮对话跑几分钟时，顶部 pill 和右栏面板一直停在旧数字，直到回合结束或手动点刷新。',
    cause:
      'refresh() 只有三个触发点：running→idle 边沿（延迟 180ms）、window focus、手动按钮。' +
      '既没有定时轮询，也没有订阅回合内的工具事件，面板可见期间不会重新取数。',
    evidence: ['lib/client.js:1323-1340 installSessionWatch 只在 running 由真变假时刷新',
      'lib/client.js:1692-1696 只有 window focus 触发刷新',
      'README.md “Refreshes after an Agent turn, on window focus, and on demand.”'],
    fix:
      '面板可见时按 2–3s 低频轮询一个「轻量」op（只读 git status + HEAD tree，不建临时 index），' +
      '内容未变则不发渲染；不可见时停表。配合 B5 的轻量实现才可持续。',
    cases: ['A13', 'O1'],
  },
  {
    id: 'B2',
    severity: 'P0',
    area: '刷新时机',
    title: 'session watch 是一次性安装，装不上就永久失去自动刷新',
    symptom:
      '新建 session（或页面刚打开、session 还没进 host 列表）时打开面板，' +
      '此后整轮整轮地不更新，只有手动刷新/切窗口才动。',
    cause:
      'installSessionWatch() 里 ctx.sessions.binding(sessionId).session 取不到就直接 return，' +
      '而它只在 watchers 0→1 时被调用一次，没有重试或等待路径。runtime 的 binding 依赖 eligible(id)' +
      '（已列入 host 列表），新 session 在首帧常常还不 eligible。',
    evidence: ['lib/client.js:1323-1333 binding/session 缺失即返回，之后不再安装',
      'lib/client.js:1688-1697 watch() 只在首个订阅者到来时调用一次 installSessionWatch',
      '@deepseek-ai/dsh-client-runtime lib/client.js:9146 binding() → resolve() → eligible() 才铸造 scope'],
    fix:
      '改成对 ctx.sessions.list 订阅：session 出现在列表里再绑 session；或在 watch 期间用' +
      '定时器/列表订阅重试安装，并在 session 被移除时清理。',
    cases: ['A14', 'O1'],
  },
  {
    id: 'B3',
    severity: 'P1',
    area: '刷新时机',
    title: '重新打开右栏 tab 不会刷新，展示上次的旧数据',
    symptom: '关掉面板再打开（从侧栏 tab 恢复，而不是点顶部 pill），内容还是关闭前的。',
    cause:
      '只有 header 入口 openPanel() 显式调 refresh()；tab 重新挂载时 setCwd() 发现 cwd 没变、' +
      'data 还在，所以既不刷新也不显示加载态。',
    evidence: ['lib/client.js:1629-1632 setCwd 仅在 data 为空时刷新',
      'lib/client.js:1785-1793 openPanel 是唯一在打开时刷新 refresh 的路径'],
    fix: '在 watch() 的 0→1 安装路径里做一次 refresh（或标记 stale 后刷新），语义是“可见即新鲜”。',
    cases: ['A15', 'O1'],
  },
  {
    id: 'B4',
    severity: 'P1',
    area: 'Diff 渲染',
    title: '每份 diff 末尾多出一条不存在的空上下文行，行号越界',
    symptom: 'diff 视图末尾总有一个空行，行号比文件真实行数大 1（例如 3 行的文件出现 old=4）。',
    cause:
      'parseUnifiedDiff 用 split(\'\\n\') 遍历，末尾换行产生的空串被当成上下文行压进 hunk；' +
      '同时 hunk 内没有按 header 的行数上限收口。',
    evidence: ['src/git.js:148-171 空串分支无条件 push ctx 并自增行号',
      '实测 keep.txt / mod.txt 都多出 {kind:"ctx",text:"",old:4,new:4}（文件只有 3 行）'],
    fix:
      '按 hunk header 的 old/new 行数计数消费，尾部超出计数的行一律丢弃。',
    fixed:
      '已修：src/git.js parseUnifiedDiff 用 header 的 old/new 计数收口，计数耗尽后不再消费行。' +
      'A1/A2 由 FAIL 转 PASS；多 hunk、删除文件、无换行结尾三类 diff 已手工复核。',
    cases: ['A1', 'A2'],
  },
  {
    id: 'B5',
    severity: 'P1',
    area: '性能',
    title: '每次快照都建临时 index 跑 git add --all，内容没变也不省',
    symptom: '大仓库/多未跟踪文件时打开面板要等 1–3s；无变化的重复刷新也要几百毫秒，轮询不可行。',
    cause:
      'captureWorkingTree() 用临时 GIT_INDEX_FILE 做 read-tree → add --all → write-tree 来得到含未跟踪文件的树。' +
      'add --all 会把所有未跟踪文件重新哈希一遍，与是否真的变化无关；整条流水线也没有' +
      '“HEAD tree 与工作树都没变就复用上次结果”的短路。',
    evidence: ['src/operations.js:307-336 captureWorkingTree 的 add --all',
      '实测 3300 文件仓库：首次 2536ms（add 2272ms ≈90%）；没有任何变化的第二次仍 349ms，其中 add 160ms ≈46%',
      '实测 aig 干净仓库：总 250ms，其中 add 181ms ≈72%',
      '实测 71 个小文件的夹具：add 仅 11ms ≈21% —— 开销随未跟踪文件的体积/数量放大'],
    fix:
      '先 git status（成本低）判断是否有变化；无变化且 HEAD tree 未变时直接复用上次 currentTree。' +
      '有变化时改用 git diff HEAD（跟踪文件）+ 未跟踪文件单独处理，避免全量 rehash；' +
      '或把临时 index 缓存在进程内按 repo 复用（add -A 的增量特性可以省掉重复哈希）。',
    cases: ['M1', 'M2', 'M3'],
  },
  {
    id: 'B6',
    severity: 'P1',
    area: '超时',
    title: '仓库级 15s 超时比内部 add 的 120s 超时更短，大仓库必然超时',
    symptom: '大仓库永远显示 “Repository snapshot timed out after 15000ms”，且没有有用信息。',
    cause:
      'snapshotRepository 用 options.repoTimeoutMs（默认 15000）包住整条流水线，' +
      '而 captureWorkingTree 里 add 自己给了 120000ms，永远等不到。',
    evidence: ['src/operations.js:51-61 DEFAULTS.repoTimeoutMs = 15000',
      'src/operations.js:320-330 add --all 的 timeoutMs = 120000',
      'src/operations.js:503-510 repoSignal 用 15s 覆盖全部子命令'],
    fix:
      '让内层超时严格小于外层（如外层 30s、add 20s），或把“超时”拆成具体阶段并在错误里带阶段名。',
    cases: ['A16', 'O6'],
  },
  {
    id: 'B7',
    severity: 'P2',
    area: '契约',
    title: 'snapshot 返回常量 captured:false，客户端的空状态分支永远走不到',
    symptom: '没有变更时提示语恒为 “选择文件查看差异”，而 “捕获” 相关文案是死代码。',
    cause: '服务端固定 captured: false；客户端却用它区分两种空状态提示。字段没有任何写入路径。',
    evidence: ['src/operations.js:615 captured: false',
      'lib/client.js:2925 data.captured ? captureHint : selectHint'],
    fix: '删除该字段与分支，或让它表达真实信息（如“是否有过快照”）。',
    cases: ['A17'],
  },
  {
    id: 'B8',
    severity: 'P2',
    area: '渲染',
    title: 'createStore 的相等短路永远不生效，每次 set 都通知订阅者',
    symptom: '面板在相同数据上重复渲染；轮询改造后会放大成热点。',
    cause: 'merged 是 {...state, ...patch} 新对象，与 state 永不相等，merged === state 恒假。',
    evidence: ['lib/client.js:1231-1241 if (merged === state) return 是死判断'],
    fix: '逐键比较或引入浅比较；至少删掉误导性的短路。',
    cases: ['A18'],
  },
  {
    id: 'B9',
    severity: 'P2',
    area: 'Diff 渲染',
    title: '纯重命名文件在详情里退化成“新增”，与列表里的 R 标记不一致',
    symptom: '列表显示 R（重命名），点开却是 +2 −0 的新增 diff。',
    cause: 'diff 命令把 pathspec 限定到新路径，git 在 pathspec 过滤后才做 rename 检测，于是识别为 A。',
    evidence: ['src/operations.js:887-899 git diff <base> <cur> -- <newPath>',
      '实测 new-name.txt：快照 status=R，diff additions=2 deletions=0'],
    fix: '路径参数同时带 oldPath（或去掉 pathspec 后再在结果里过滤），保留 rename 头。',
    cases: ['A3'],
  },
  {
    id: 'B10',
    severity: 'P2',
    area: '历史',
    title: '打开版本选择器会对所有分支并发加载 commits',
    symptom: '分支多的仓库（上限 200/仓库）一打开下拉就卡一下，并打出一串 git log。',
    cause: 'effect 遍历全部 repo.branches 调 loadCommits，而不是只加载展开/可见的分支。',
    evidence: ['lib/client.js:2230-2241 打开时对每个分支 loadCommits'],
    fix: '展开分支时再加载，或用 createIntersectionObserver/虚拟列表按需加载。',
    cases: ['O2'],
  },
  {
    id: 'B11',
    severity: 'P2',
    area: '历史',
    title: '“本 Session 提交”的基线取决于面板何时第一次被打开',
    symptom: '整轮没打开面板就开始干活，结束后再打开，“本 Session 暂无提交”，看不到刚提交的 commit。',
    cause:
      '基线在 loadHistory 时按“首次观察到的分支 HEAD”记录；如果首次观察发生在提交之后，' +
      '基线就已经包含这些提交，rev-list ^baseline 自然为空。',
    evidence: ['lib/client.js:1122-1136 captureHistoryBaselines 只在缺失时写入',
      'lib/client.js:1405-1444 loadHistory 是唯一写基线的地方',
      '实测 session-8eb3e07a 的 sessionStorage 基线被写成 32ca2a1（最后一次提交），历史为空'],
    fix:
      '在 session 打开（而不是面板打开）时就记录基线；或把基线记录下沉到服务端 session 生命周期，' +
      '与面板可见性解耦。',
    fixed:
      '已修：history 请求携带 sessionId，host 用 SessionHeader.createdAt 作为 Session 开始时刻，' +
      '再从每个分支的 reflog 取该时刻前的最后一次 ref 更新作为基线（src/operations.js:246-315、' +
      'index.js:127-132）。面板晚打开或换标签页重开都不影响基线；' +
      '实测 session-8eb3e07a 恢复出 4 个本 Session 提交。',
    cases: ['O4'],
  },
  {
    id: 'B12',
    severity: 'P2',
    area: '历史',
    title: '每次刷新清空 branchCommits，已加载的分支提交被丢弃重载',
    symptom: '刷新后历史下拉里已展开的分支要重新转圈。',
    cause: 'loadHistory 里 branchCommits: {} 无条件重置。',
    evidence: ['lib/client.js:1434 branchCommits: {}'],
    fix: '只清理已消失分支的 key，保留其余（可用容量上限 + LRU）。',
    cases: ['O3'],
  },
  {
    id: 'B13',
    severity: 'P3',
    area: '界面',
    title: '“capturedAt” 标签显示的其实是 baseline tree 哈希前 7 位',
    symptom: '副标题里出现类似 4b825dc 的短哈希，没有时间信息，语义不明。',
    cause: '文案 key 叫 capturedAt，渲染的却是 tree.slice(0,7)；真正的 capturedAt 毫秒时间戳没用到。',
    evidence: ['lib/client.js:2965-2967 text(panel.capturedAt, { hash: data.baseline.tree.slice(0, 7) })'],
    fix: '显示相对时间（“刚刚/12 秒前”）并在轮询下实时走字；哈希放到 title。',
    cases: ['O5'],
  },
  {
    id: 'B14',
    severity: 'P3',
    area: '状态',
    title: '冲突文件的 states 只有 conflicted，丢掉 staged/unstaged 维度',
    symptom: '冲突文件在“已暂存/未暂存”筛选里消失，计数与 git status 的 XY 两位不一致。',
    cause: 'fileStates() 遇到 conflicted 直接返回单元素数组。',
    evidence: ['src/operations.js:298-305 if (status?.conflicted) return [\'conflicted\']'],
    fix: '冲突时同时保留 staged/unstaged（XY 各自非空时），或明确文档化为“冲突优先”。',
    cases: ['A7'],
  },
  {
    id: 'B15',
    severity: 'P2',
    area: '性能',
    title: '快照是全量 JSON，几千个文件时单次响应数百 KB',
    symptom: '大仓库每次刷新都要重传整棵树，轮询会明显吃带宽和 GC。',
    cause: 'snapshot 返回 files[] + repos[] 全量；没有摘要/增量接口。',
    evidence: ['实测 4300 个变更文件：status 输出 70KB，返回对象含 4300 条 file 记录'],
    fix: '轮询走 summary-only op（只回 summary + 计数 + 每仓库 HEAD/序号），面板可见时再取全量。',
    cases: ['M2'],
  },
  {
    id: 'B16',
    severity: 'P1',
    area: 'Diff 渲染',
    title: '刷新后旧 diff 被保留，短时间内 diff 与文件行数对不上',
    symptom: '刷新时列表已换成新数据，右侧 diff 还是上一次快照的内容，行数/内容短暂不一致。',
    cause: 'refresh() 成功时 diff 字段保持原值（selectedFile ? store.get().diff : null），' +
      '随后才异步 loadDiff；期间 UI 用新 tree 的文件信息配旧 diff。',
    evidence: ['lib/client.js:1386-1395 set({ ... diff: selectedFile ? store.get().diff : null })'],
    fix: '刷新时把 diff 置空并进入 loading，或给 diff 打上 snapshot 版本号，版本不匹配就显示加载态。',
    cases: ['O5'],
  },
  {
    id: 'B17',
    severity: 'P1',
    area: '变更列表',
    title: '「重命名 + 改内容」被拆成 D + A 两条，文件数虚高、D 行状态还是错的',
    symptom:
      '改名同时重构（很常见）：面板出现两个文件——旧的显示“删除/未暂存”，新的显示“新增”，' +
      '而 git status 只认为这是一个已暂存的重命名。文件总数比 git 多一条。',
    cause:
      '文件列表来自 baseline tree 与 current tree 的 `git diff --find-renames`，相似度跌破 50% 时 ' +
      'git 自己就报 D+A；状态却来自 `git status`（index 视角，报 R）。两个数据源没有对齐合并，' +
      '被拆出的 D 行按旧路径查不到状态，于是落到 fileStates 的默认值 ["unstaged"]。',
    evidence: ['src/operations.js:356-383 changeList 只看 tree diff',
      'src/operations.js:475-500 enrichFiles 按 file.path / file.oldPath 查 status，拆出的 D 行两个都查不到',
      '实测验收夹具：`git status` = `RM src/report_daily.py -> src/report_daily_v2.py`，' +
        '面板 = `D src/report_daily.py` + `A src/report_daily_v2.py`（20 条 vs git 的 19 条）'],
    fix:
      '用 status 的 oldPath 回填：若 status 是 R 且列表里同时存在 D(oldPath) 与 A(path)，合并为一条 R；' +
      '更彻底的做法是以 `git status` 作为列表来源，tree diff 只用来补行数。',
    cases: ['A19'],
  },
]

export const SEVERITY_ORDER = ['P0', 'P1', 'P2', 'P3']

export function bugById(id) {
  return BUGS.find((bug) => bug.id === id) || null
}
