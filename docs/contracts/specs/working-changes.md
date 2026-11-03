# 能力：当前工作区变更

最后核验：2026-11-03
覆盖：`index.js`, `src/operations.js`, `lib/client.js`, `test/operations.test.mjs`,
`test/client-tree.test.mjs`
驱动：在单仓库或多仓库工作区开始 DSH Session，打开右侧栏，检查状态筛选、
层级文件树、搜索和文件 diff；再从 Header 下拉检查本地分支与 Commit。

## 用户可见行为

- 只读比较当前工作树与各仓库 `HEAD`，不修改用户真实 Git index。
- 工作区本身是 Git 仓库时，按该仓库展示，保留原有 `repo`、`baseline`、
  `current`、`files`、`summary` 字段。
- 工作区本身不是 Git 仓库时，默认向下发现一层包含 `.git` 的独立仓库。
- 多仓库时，每个文件同时携带所属仓库、仓库相对路径和工作区相对路径。
- Header Hover 始终展示每个仓库的项目名和当前分支；即使仓库刚初始化、尚无
  HEAD 或 Commit，也使用当前 symbolic branch。多仓库 Header 显示仓库数、
  文件数、总新增和总删除，Hover 与右侧栏按仓库分组。
- 右侧栏文件区使用 Codex 风格层级树，只展示包含变更文件的目录；目录可折叠，
  搜索匹配仓库名、新路径或重命名前路径，并自动展开匹配路径的父目录。
- 每个文件带有 `staged`、`unstaged`、`untracked`、`conflicted` 状态；同一文件
  可以同时处于已暂存和未暂存状态，右侧栏提供状态筛选和状态数量。
- 每个 diff 请求携带仓库根、该仓库的 baseline tree 和 current tree。
- 部分仓库失败时仍返回其他仓库结果；失败仓库显示原因。
- 无仓库、无 HEAD、仓库全干净、单个仓库不可读时均返回结构化结果，不抛全局错误。
- 二进制文件列出但不渲染正文；单个 diff 超过 400,000 字符时截断。
- 文件 diff 仍是工作区相对 `HEAD` 的合并 diff；状态标记不改变 diff 的比较范围。

## Snapshot 选项

| 字段 | 默认 | 行为 |
|---|---:|---|
| `discoverDepth` | 1 | 子目录发现深度，超过一层时跳过依赖和构建目录 |
| `repos` | `[]` | 非空时关闭自动发现，只处理清单内仓库 |
| `repoLabels` | `{}` | 仓库路径到显示名的映射 |
| `untracked` | `list` | `list` 展示未跟踪文件；`ignore` 不计算 |
| `maxRepos` | 20 | 超限时截断并返回 `workspace.truncated` |
| `concurrency` | 4 | 仓库级并发上限 |
| `repoTimeoutMs` | 15000 | 单个仓库快照超时 |

## Diff 约束

- `repoRoot` 缺省时回落到从 `cwd` 推导出的仓库根，兼容旧客户端。
- `repoRoot` 必须等于目标仓库根，并且与工作区存在包含关系。
- `path` 必须位于目标仓库内，绝对路径和路径穿越会被拒绝。

## 明确不做

- 不合并各仓库为一份连续 diff。
- 不做 stage、commit、stash、切分支、push 或 pull。
- 不展开 submodule。
- 不扫描依赖目录，也不做无限深度发现。
