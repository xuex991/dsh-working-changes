# 契约：本地分支历史

状态：已验证；日期：2026-11-03；来源：用户需求
北极星：在当前 Session 的工作区中，从“当前变更”下拉逐项目浏览所有本地分支的
Git log，并打开选中 Commit 相对父 Commit 的文件变更。

## 目标

- 右侧栏 Header 的“当前变更”是一个下拉选择器，首项为“当前变更”。
- “当前”继续比较工作树与 `HEAD`，但每个文件区分已暂存、未暂存、未跟踪和冲突状态。
- Git log 只读取 `refs/heads/*` 本地分支，不展示远程分支、Push 状态或 Push 事件。
- 下拉项按“项目 → 本地分支 → Commit”展示；Commit 按提交时间倒序排列。
- 每条记录以“项目 + 本地分支 + Commit SHA”区分；同一 Commit 出现在多个分支时，
  在每个分支下各保留一条记录。
- 选中 Commit 后，展示该 Commit 相对第一个父 Commit 的文件变更；根 Commit 与空树比较。
- Git log 保持只读，不执行 fetch、checkout、commit、push 或其他写操作。
- Session 只决定当前项目范围，不按 Session 开始时间裁剪 Commit 历史。

## 边界

- 单分支最多读取 500 个 Commit，超过时明确显示截断；单个项目最多读取 200 个本地分支。
- Merge Commit 与其第一个父 Commit 比较，并标记为 Merge。
- 一个项目读取失败不隐藏其他项目的历史。
- “当前”中的同一文件可以同时属于已暂存和未暂存状态。

## 用户行为场景

| 场景 | 期望 | 测试 |
|---|---|---|
| S-01 同一文件先暂存再继续修改 | 当前文件同时显示已暂存和未暂存状态，并可通过状态筛选找到 | `test/operations.test.mjs::snapshot distinguishes staged, unstaged, untracked, and conflicted files` |
| S-02 多仓库工作区包含多个本地分支和远程分支 | 历史按项目列出本地分支，不出现远程分支 | `test/operations.test.mjs::history lists local branches per repository and excludes remotes` |
| S-03 展开一个本地分支 | 返回该分支可达 Commit，按提交时间倒序，记录分支和 Commit SHA | `test/operations.test.mjs::branch commits are returned newest first with branch identity` |
| S-04 选中普通 Commit | 文件列表等于该 Commit 相对第一个父 Commit 的变更 | `test/operations.test.mjs::commit view compares against the first parent` |
| S-05 选中根 Commit | 所有文件按新增处理，并可打开文件 diff | `test/operations.test.mjs::root commit compares against the empty tree` |
| S-06 当前变更和 Git log 切换 | 当前文件树、状态筛选、本地分支 Commit 选择和文件 diff 均可用 | manual：打开“当前变更”下拉 → 选择 `main · <sha>` → 打开文件 diff → 返回“当前变更” |

## 状态回填

- [x] S-01 已验证：`npm test` 通过
- [x] S-02 已验证：`npm test` 通过
- [x] S-03 已验证：`npm test` 通过
- [x] S-04 已验证：`npm test` 通过
- [x] S-05 已验证：`npm test` 通过
- [x] S-06 已验证：DSH 实际界面打开项目分组下拉，选择 `backend · main · 10fa468`，文件树和 diff 正常显示
