# 能力：本地分支历史

最后核验：2026-11-10
覆盖：`index.js`, `src/operations.js`, `lib/client.js`, `test/operations.test.mjs`,
`test/client-tree.test.mjs`
驱动：在单仓库或多仓库工作区开始 Session，展开“当前变更”下拉，选择一个本
Session 内的本地分支 Commit，再打开该 Commit 的文件 diff。

## 用户可见行为

- Header 的“当前变更”是下拉选择器；首项返回当前未提交变更。
- 下拉按项目列出 `refs/heads/*` 本地分支，不列出远程分支。
- 当前分支优先显示并带“当前”标记；其他分支按分支头提交时间倒序。
- Session 基线在 Session 创建时刻确定：取该分支 reflog 中时间不晚于 Session
  创建时间的最后一次 ref 更新，作为 Git 祖先基线；面板何时打开不影响基线。
- Session 创建后才出现的新分支，用创建记录（`branch: Created from`）的基点作为基线。
- 无法从 reflog 取得基线时（reflog 被裁剪或不可用），退回“首次观察到的分支 HEAD”，
  之后刷新不覆盖。基线按 Session 和工作区保存在 `localStorage`，并兼容读取旧的
  `sessionStorage`。
- 打开下拉后读取分支 Commit，只返回当前分支 HEAD 可达、但 Session 基线不可达的
  Commit（等价于 `git rev-list <head> ^<baseline>`）。Commit 范围只使用 Git 祖先
  关系；时间只用于挑选基线，不用于筛选 Commit。
- 每个本地分支使用自己的基线。
- 同一会话内保留已加载结果；刷新历史时重新读取列表，但保留原有基线。
- Commit 下拉项首行显示 `branch · short SHA`，第二行显示提交标题，右侧显示时间。
- 没有 Session 内 Commit 的分支明确显示“本 Session 暂无提交”。
- 根提交（仓库初始化提交）不进入下拉列表。
- 历史记录的身份是“项目 + 本地分支 + Commit SHA”；同一 Commit 可以在多个分支下出现。
- 选中 Commit 后，显示该 Commit 相对第一个父提交的文件变更。
- 根 Commit 使用空树作为基线；Merge Commit 明确标记并同样与第一个父提交比较。
- 选中历史文件后，复用只读的 unified diff 视图；返回时保留当前 Commit。
- Push、Fetch、分支切换和远程分支均不生成历史节点，也不显示 Push 状态。

## 读取上限

- 每个仓库最多读取 200 个本地分支，超出时显示截断提示。
- 每个分支最多读取 500 个 Session Commit，超出时显示截断提示。

## 错误与只读边界

- 单个仓库读取失败时，其他仓库的历史仍可浏览。
- 分支 Commit 读取失败时，只在该分支下显示错误并可重试。
- Session 基线无效或不存在时，该分支显示错误而不回退到完整分支历史。
- Git log 只执行读取命令，不执行 fetch、checkout、commit、push 或其他写操作。
- 不支持远程分支历史、Push 审计、跨仓库连续 Commit 时间线和 Commit 搜索。
