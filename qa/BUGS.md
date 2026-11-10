# Working Changes · Bug 清单（收敛版）

> 本文件由 `qa/run.mjs` 生成，数据源是 `qa/bugs.mjs`；改清单请改 `qa/bugs.mjs` 再重跑。

- 插件版本：`dsh-working-changes@0.5.4`（HEAD `cb64506`）
- 生成时间：2026/11/10 17:47:42
- 断言：8/18 通过
- 条目：17 条（P0 2 · P1 6 · P2 7 · P3 2）

## 一览

| ID | 级别 | 模块 | 问题 | 用例 | 当前 |
|---|---|---|---|---|---|
| [B1](#b1) | P0 | 刷新时机 | Agent 回合进行中面板完全冻结，没有任何自动更新 | A13 | **已复现** |
| [B2](#b2) | P0 | 刷新时机 | session watch 是一次性安装，装不上就永久失去自动刷新 | A14 | **已复现** |
| [B3](#b3) | P1 | 刷新时机 | 重新打开右栏 tab 不会刷新，展示上次的旧数据 | A15 | **已复现** |
| [B4](#b4) | P1 | Diff 渲染 | 每份 diff 末尾多出一条不存在的空上下文行，行号越界 | A1 A2 | 已修复 |
| [B5](#b5) | P1 | 性能 | 每次快照都建临时 index 跑 git add --all，内容没变也不省 | A11 | **已复现** |
| [B6](#b6) | P1 | 超时 | 仓库级 15s 超时比内部 add 的 120s 超时更短，大仓库必然超时 | A16 | **已复现** |
| [B7](#b7) | P2 | 契约 | snapshot 返回常量 captured:false，客户端的空状态分支永远走不到 | A17 | **已复现** |
| [B8](#b8) | P2 | 渲染 | createStore 的相等短路永远不生效，每次 set 都通知订阅者 | A18 | **已复现** |
| [B9](#b9) | P2 | Diff 渲染 | 纯重命名文件在详情里退化成“新增”，与列表里的 R 标记不一致 | A3 | **已复现** |
| [B10](#b10) | P2 | 历史 | 打开版本选择器会对所有分支并发加载 commits | — | 代码证据 |
| [B11](#b11) | P2 | 历史 | “本 Session 提交”的基线取决于面板何时第一次被打开 | — | 已修复 |
| [B12](#b12) | P2 | 历史 | 每次刷新清空 branchCommits，已加载的分支提交被丢弃重载 | — | 代码证据 |
| [B13](#b13) | P3 | 界面 | “capturedAt” 标签显示的其实是 baseline tree 哈希前 7 位 | — | 代码证据 |
| [B14](#b14) | P3 | 状态 | 冲突文件的 states 只有 conflicted，丢掉 staged/unstaged 维度 | A7 | **已复现** |
| [B15](#b15) | P2 | 性能 | 快照是全量 JSON，几千个文件时单次响应数百 KB | — | 代码证据 |
| [B16](#b16) | P1 | Diff 渲染 | 刷新后旧 diff 被保留，短时间内 diff 与文件行数对不上 | — | 代码证据 |
| [B17](#b17) | P1 | 变更列表 | 「重命名 + 改内容」被拆成 D + A 两条，文件数虚高、D 行状态还是错的 | A19 | **已复现** |

## B1

**Agent 回合进行中面板完全冻结，没有任何自动更新**

- 级别：P0 · 模块：刷新时机
- 对应用例：`A13` （当前失败）

**现象**：一轮对话跑几分钟时，顶部 pill 和右栏面板一直停在旧数字，直到回合结束或手动点刷新。

**成因**：refresh() 只有三个触发点：running→idle 边沿（延迟 180ms）、window focus、手动按钮。既没有定时轮询，也没有订阅回合内的工具事件，面板可见期间不会重新取数。

**证据**：
- lib/client.js:1323-1340 installSessionWatch 只在 running 由真变假时刷新
- lib/client.js:1692-1696 只有 window focus 触发刷新
- README.md “Refreshes after an Agent turn, on window focus, and on demand.”

**修复方向**：面板可见时按 2–3s 低频轮询一个「轻量」op（只读 git status + HEAD tree，不建临时 index），内容未变则不发渲染；不可见时停表。配合 B5 的轻量实现才可持续。

## B2

**session watch 是一次性安装，装不上就永久失去自动刷新**

- 级别：P0 · 模块：刷新时机
- 对应用例：`A14` （当前失败）

**现象**：新建 session（或页面刚打开、session 还没进 host 列表）时打开面板，此后整轮整轮地不更新，只有手动刷新/切窗口才动。

**成因**：installSessionWatch() 里 ctx.sessions.binding(sessionId).session 取不到就直接 return，而它只在 watchers 0→1 时被调用一次，没有重试或等待路径。runtime 的 binding 依赖 eligible(id)（已列入 host 列表），新 session 在首帧常常还不 eligible。

**证据**：
- lib/client.js:1323-1333 binding/session 缺失即返回，之后不再安装
- lib/client.js:1688-1697 watch() 只在首个订阅者到来时调用一次 installSessionWatch
- @deepseek-ai/dsh-client-runtime lib/client.js:9146 binding() → resolve() → eligible() 才铸造 scope

**修复方向**：改成对 ctx.sessions.list 订阅：session 出现在列表里再绑 session；或在 watch 期间用定时器/列表订阅重试安装，并在 session 被移除时清理。

## B3

**重新打开右栏 tab 不会刷新，展示上次的旧数据**

- 级别：P1 · 模块：刷新时机
- 对应用例：`A15` （当前失败）

**现象**：关掉面板再打开（从侧栏 tab 恢复，而不是点顶部 pill），内容还是关闭前的。

**成因**：只有 header 入口 openPanel() 显式调 refresh()；tab 重新挂载时 setCwd() 发现 cwd 没变、data 还在，所以既不刷新也不显示加载态。

**证据**：
- lib/client.js:1629-1632 setCwd 仅在 data 为空时刷新
- lib/client.js:1785-1793 openPanel 是唯一在打开时刷新 refresh 的路径

**修复方向**：在 watch() 的 0→1 安装路径里做一次 refresh（或标记 stale 后刷新），语义是“可见即新鲜”。

## B4

**每份 diff 末尾多出一条不存在的空上下文行，行号越界**

- 级别：P1 · 模块：Diff 渲染
- 对应用例：`A1` （当前通过）、`A2` （当前通过）

**现象**：diff 视图末尾总有一个空行，行号比文件真实行数大 1（例如 3 行的文件出现 old=4）。

**成因**：parseUnifiedDiff 用 split('\n') 遍历，末尾换行产生的空串被当成上下文行压进 hunk；同时 hunk 内没有按 header 的行数上限收口。

**证据**：
- src/git.js:148-171 空串分支无条件 push ctx 并自增行号
- 实测 keep.txt / mod.txt 都多出 {kind:"ctx",text:"",old:4,new:4}（文件只有 3 行）

**修复方向**：按 hunk header 的 old/new 行数计数消费，尾部超出计数的行一律丢弃。

**状态**：已修：src/git.js parseUnifiedDiff 用 header 的 old/new 计数收口，计数耗尽后不再消费行。A1/A2 由 FAIL 转 PASS；多 hunk、删除文件、无换行结尾三类 diff 已手工复核。

## B5

**每次快照都建临时 index 跑 git add --all，内容没变也不省**

- 级别：P1 · 模块：性能
- 对应用例：`A11` （当前失败）

**现象**：大仓库/多未跟踪文件时打开面板要等 1–3s；无变化的重复刷新也要几百毫秒，轮询不可行。

**成因**：captureWorkingTree() 用临时 GIT_INDEX_FILE 做 read-tree → add --all → write-tree 来得到含未跟踪文件的树。add --all 会把所有未跟踪文件重新哈希一遍，与是否真的变化无关；整条流水线也没有“HEAD tree 与工作树都没变就复用上次结果”的短路。

**证据**：
- src/operations.js:307-336 captureWorkingTree 的 add --all
- 实测 3300 文件仓库：首次 2536ms（add 2272ms ≈90%）；没有任何变化的第二次仍 349ms，其中 add 160ms ≈46%
- 实测 aig 干净仓库：总 250ms，其中 add 181ms ≈72%
- 实测 71 个小文件的夹具：add 仅 11ms ≈21% —— 开销随未跟踪文件的体积/数量放大

**修复方向**：先 git status（成本低）判断是否有变化；无变化且 HEAD tree 未变时直接复用上次 currentTree。有变化时改用 git diff HEAD（跟踪文件）+ 未跟踪文件单独处理，避免全量 rehash；或把临时 index 缓存在进程内按 repo 复用（add -A 的增量特性可以省掉重复哈希）。

## B6

**仓库级 15s 超时比内部 add 的 120s 超时更短，大仓库必然超时**

- 级别：P1 · 模块：超时
- 对应用例：`A16` （当前失败）

**现象**：大仓库永远显示 “Repository snapshot timed out after 15000ms”，且没有有用信息。

**成因**：snapshotRepository 用 options.repoTimeoutMs（默认 15000）包住整条流水线，而 captureWorkingTree 里 add 自己给了 120000ms，永远等不到。

**证据**：
- src/operations.js:51-61 DEFAULTS.repoTimeoutMs = 15000
- src/operations.js:320-330 add --all 的 timeoutMs = 120000
- src/operations.js:503-510 repoSignal 用 15s 覆盖全部子命令

**修复方向**：让内层超时严格小于外层（如外层 30s、add 20s），或把“超时”拆成具体阶段并在错误里带阶段名。

## B16

**刷新后旧 diff 被保留，短时间内 diff 与文件行数对不上**

- 级别：P1 · 模块：Diff 渲染
- 对应用例：—

**现象**：刷新时列表已换成新数据，右侧 diff 还是上一次快照的内容，行数/内容短暂不一致。

**成因**：refresh() 成功时 diff 字段保持原值（selectedFile ? store.get().diff : null），随后才异步 loadDiff；期间 UI 用新 tree 的文件信息配旧 diff。

**证据**：
- lib/client.js:1386-1395 set({ ... diff: selectedFile ? store.get().diff : null })

**修复方向**：刷新时把 diff 置空并进入 loading，或给 diff 打上 snapshot 版本号，版本不匹配就显示加载态。

## B17

**「重命名 + 改内容」被拆成 D + A 两条，文件数虚高、D 行状态还是错的**

- 级别：P1 · 模块：变更列表
- 对应用例：`A19` （当前失败）

**现象**：改名同时重构（很常见）：面板出现两个文件——旧的显示“删除/未暂存”，新的显示“新增”，而 git status 只认为这是一个已暂存的重命名。文件总数比 git 多一条。

**成因**：文件列表来自 baseline tree 与 current tree 的 `git diff --find-renames`，相似度跌破 50% 时 git 自己就报 D+A；状态却来自 `git status`（index 视角，报 R）。两个数据源没有对齐合并，被拆出的 D 行按旧路径查不到状态，于是落到 fileStates 的默认值 ["unstaged"]。

**证据**：
- src/operations.js:356-383 changeList 只看 tree diff
- src/operations.js:475-500 enrichFiles 按 file.path / file.oldPath 查 status，拆出的 D 行两个都查不到
- 实测验收夹具：`git status` = `RM src/report_daily.py -> src/report_daily_v2.py`，面板 = `D src/report_daily.py` + `A src/report_daily_v2.py`（20 条 vs git 的 19 条）

**修复方向**：用 status 的 oldPath 回填：若 status 是 R 且列表里同时存在 D(oldPath) 与 A(path)，合并为一条 R；更彻底的做法是以 `git status` 作为列表来源，tree diff 只用来补行数。

## B7

**snapshot 返回常量 captured:false，客户端的空状态分支永远走不到**

- 级别：P2 · 模块：契约
- 对应用例：`A17` （当前失败）

**现象**：没有变更时提示语恒为 “选择文件查看差异”，而 “捕获” 相关文案是死代码。

**成因**：服务端固定 captured: false；客户端却用它区分两种空状态提示。字段没有任何写入路径。

**证据**：
- src/operations.js:615 captured: false
- lib/client.js:2925 data.captured ? captureHint : selectHint

**修复方向**：删除该字段与分支，或让它表达真实信息（如“是否有过快照”）。

## B8

**createStore 的相等短路永远不生效，每次 set 都通知订阅者**

- 级别：P2 · 模块：渲染
- 对应用例：`A18` （当前失败）

**现象**：面板在相同数据上重复渲染；轮询改造后会放大成热点。

**成因**：merged 是 {...state, ...patch} 新对象，与 state 永不相等，merged === state 恒假。

**证据**：
- lib/client.js:1231-1241 if (merged === state) return 是死判断

**修复方向**：逐键比较或引入浅比较；至少删掉误导性的短路。

## B9

**纯重命名文件在详情里退化成“新增”，与列表里的 R 标记不一致**

- 级别：P2 · 模块：Diff 渲染
- 对应用例：`A3` （当前失败）

**现象**：列表显示 R（重命名），点开却是 +2 −0 的新增 diff。

**成因**：diff 命令把 pathspec 限定到新路径，git 在 pathspec 过滤后才做 rename 检测，于是识别为 A。

**证据**：
- src/operations.js:887-899 git diff <base> <cur> -- <newPath>
- 实测 new-name.txt：快照 status=R，diff additions=2 deletions=0

**修复方向**：路径参数同时带 oldPath（或去掉 pathspec 后再在结果里过滤），保留 rename 头。

## B10

**打开版本选择器会对所有分支并发加载 commits**

- 级别：P2 · 模块：历史
- 对应用例：—

**现象**：分支多的仓库（上限 200/仓库）一打开下拉就卡一下，并打出一串 git log。

**成因**：effect 遍历全部 repo.branches 调 loadCommits，而不是只加载展开/可见的分支。

**证据**：
- lib/client.js:2230-2241 打开时对每个分支 loadCommits

**修复方向**：展开分支时再加载，或用 createIntersectionObserver/虚拟列表按需加载。

## B11

**“本 Session 提交”的基线取决于面板何时第一次被打开**

- 级别：P2 · 模块：历史
- 对应用例：—

**现象**：整轮没打开面板就开始干活，结束后再打开，“本 Session 暂无提交”，看不到刚提交的 commit。

**成因**：基线在 loadHistory 时按“首次观察到的分支 HEAD”记录；如果首次观察发生在提交之后，基线就已经包含这些提交，rev-list ^baseline 自然为空。

**证据**：
- lib/client.js:1122-1136 captureHistoryBaselines 只在缺失时写入
- lib/client.js:1405-1444 loadHistory 是唯一写基线的地方
- 实测 session-8eb3e07a 的 sessionStorage 基线被写成 32ca2a1（最后一次提交），历史为空

**修复方向**：在 session 打开（而不是面板打开）时就记录基线；或把基线记录下沉到服务端 session 生命周期，与面板可见性解耦。

**状态**：已修：history 请求携带 sessionId，host 用 SessionHeader.createdAt 作为 Session 开始时刻，再从每个分支的 reflog 取该时刻前的最后一次 ref 更新作为基线（src/operations.js:246-315、index.js:127-132）。面板晚打开或换标签页重开都不影响基线；实测 session-8eb3e07a 恢复出 4 个本 Session 提交。

## B12

**每次刷新清空 branchCommits，已加载的分支提交被丢弃重载**

- 级别：P2 · 模块：历史
- 对应用例：—

**现象**：刷新后历史下拉里已展开的分支要重新转圈。

**成因**：loadHistory 里 branchCommits: {} 无条件重置。

**证据**：
- lib/client.js:1434 branchCommits: {}

**修复方向**：只清理已消失分支的 key，保留其余（可用容量上限 + LRU）。

## B15

**快照是全量 JSON，几千个文件时单次响应数百 KB**

- 级别：P2 · 模块：性能
- 对应用例：—

**现象**：大仓库每次刷新都要重传整棵树，轮询会明显吃带宽和 GC。

**成因**：snapshot 返回 files[] + repos[] 全量；没有摘要/增量接口。

**证据**：
- 实测 4300 个变更文件：status 输出 70KB，返回对象含 4300 条 file 记录

**修复方向**：轮询走 summary-only op（只回 summary + 计数 + 每仓库 HEAD/序号），面板可见时再取全量。

## B13

**“capturedAt” 标签显示的其实是 baseline tree 哈希前 7 位**

- 级别：P3 · 模块：界面
- 对应用例：—

**现象**：副标题里出现类似 4b825dc 的短哈希，没有时间信息，语义不明。

**成因**：文案 key 叫 capturedAt，渲染的却是 tree.slice(0,7)；真正的 capturedAt 毫秒时间戳没用到。

**证据**：
- lib/client.js:2965-2967 text(panel.capturedAt, { hash: data.baseline.tree.slice(0, 7) })

**修复方向**：显示相对时间（“刚刚/12 秒前”）并在轮询下实时走字；哈希放到 title。

## B14

**冲突文件的 states 只有 conflicted，丢掉 staged/unstaged 维度**

- 级别：P3 · 模块：状态
- 对应用例：`A7` （当前失败）

**现象**：冲突文件在“已暂存/未暂存”筛选里消失，计数与 git status 的 XY 两位不一致。

**成因**：fileStates() 遇到 conflicted 直接返回单元素数组。

**证据**：
- src/operations.js:298-305 if (status?.conflicted) return ['conflicted']

**修复方向**：冲突时同时保留 staged/unstaged（XY 各自非空时），或明确文档化为“冲突优先”。

## 建议修复顺序

1. **B5 + B15 → B1**：先把“取数”变便宜（status 快速路径 + 摘要 op），再打开轮询；顺序反过来会把 CPU 打满。
2. **B2**：session watch 不能一次性安装，这是“有的 session 永远不刷新”的根因，改动小、收益直接。
3. **B4**：diff 尾部幻影行，一行修复 + 现有用例锁死，顺手把 diff 视图的可信度拉回来。
4. **B3 / B16**：可见即新鲜、diff 与快照同版本，属于同一族“陈旧数据”问题，一起做。
5. **B6**：超时层级拧过来，让大仓库的失败可诊断。
6. **B7 / B8 / B9 / B13**：低成本清理，可与上面同批。
7. **B10 / B11 / B12**：历史模块的性能与基线语义，建议单独一轮。

## 已确认正常（回归护栏）

- `A4` 未跟踪文件应能出 diff（回归护栏） — 通过
- `A5` 二进制文件应标记 binary 且不产出 hunk（回归护栏） — 通过
- `A6` 富场景仓库：变更类型、状态、未跟踪目录都齐全（回归护栏） — 通过
- `A8` 无提交仓库（unborn HEAD）应正常出快照（回归护栏） — 通过
- `A9` 多仓库工作区：发现、仓库名去歧义、路径前缀（回归护栏） — 通过
- `A10` 工作区是仓库子目录时，快照覆盖整仓库（记录现状） — 通过

## 怎么跑

```bash
node qa/run.mjs            # 全量：造夹具 → 断言 → 度量 → 写 report/report.html + BUGS.md
node qa/run.mjs --no-perf  # 跳过耗时度量（大仓库夹具）
node qa/run.mjs --only=A1  # 只跑一条用例
```

夹具落在 `qa/.fixtures/`（已 gitignore），每次运行重建。
