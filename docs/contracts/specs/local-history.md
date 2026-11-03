# 能力：本地分支历史

最后核验：2026-11-03
覆盖：`index.js`, `src/operations.js`, `lib/client.js`, `test/operations.test.mjs`,
`test/client-tree.test.mjs`
驱动：在单仓库或多仓库工作区打开右侧栏，展开“当前变更”下拉，选择一个本地分支
Commit，再打开该 Commit 的文件 diff。

## 用户可见行为

- Header 的“当前变更”是下拉选择器；首项返回当前未提交变更。
- 下拉按项目列出 `refs/heads/*` 本地分支，不列出远程分支。
- 当前分支优先显示并带“当前”标记；其他分支按分支头提交时间倒序。
- 打开下拉后按需读取本地分支的 Commit；同一会话内保留已加载结果，刷新历史后重新读取。
- Commit 下拉项首行显示 `branch · short SHA`，第二行显示提交标题，右侧显示时间。
- 根提交（仓库初始化提交）不进入下拉列表；历史从第一个有父提交的 Commit 开始。
- 历史记录的身份是“项目 + 本地分支 + Commit SHA”；同一 Commit 可以在多个分支下出现。
- 选中 Commit 后，显示该 Commit 相对第一个父提交的文件变更。
- 根 Commit 使用空树作为基线；Merge Commit 明确标记并同样与第一个父提交比较。
- 选中历史文件后，复用只读的 unified diff 视图；返回时保留当前 Commit。
- Push、Fetch、分支切换和远程分支均不生成历史节点，也不显示 Push 状态。

## 读取上限

- 每个仓库最多读取 200 个本地分支，超出时显示截断提示。
- 每个分支最多读取 500 个 Commit，超出时显示截断提示。

## 错误与只读边界

- 单个仓库读取失败时，其他仓库的历史仍可浏览。
- 分支 Commit 读取失败时，只在该分支下显示错误并可重试。
- Git log 只执行读取命令，不执行 fetch、checkout、commit、push 或其他写操作。
- 不支持远程分支历史、Push 审计、跨仓库连续 Commit 时间线和 Commit 搜索。
