# 契约：Codex 风格变更文件树

状态：已验证；日期：2026-11-03；来源：用户需求
北极星：右侧栏用层级目录展示变更文件，只出现确实包含变更的目录，并可按路径搜索。

## 目标

- 文件区从平铺目录分组改为 Codex 风格层级树。
- 只展示包含变更文件的目录，不展示无关目录或空目录。
- 目录支持展开和折叠；搜索时自动展开匹配文件的父目录。
- 搜索匹配仓库名、新路径和重命名前路径。
- 保留仓库分组、文件状态、增删行数、二进制标记和 diff 选择行为。
- 本次不增加 Git 写操作、文件编辑或代码内容搜索。

## 用户行为场景

| 场景 | 期望 | 测试 |
|---|---|---|
| S-01 工作区同时有根文件和多层目录变更 | 树中只出现承载变更文件的目录，父子层级正确 | `test/client-tree.test.mjs::change tree contains only directories that lead to changed files` |
| S-02 搜索文件名或目录名 | 只保留匹配文件及其父目录，并自动展开 | `test/client-tree.test.mjs::search matches paths and old rename paths then keeps their ancestors` |
| S-03 搜索重命名前路径 | 匹配的新文件被保留，父目录只来自新路径 | `test/client-tree.test.mjs::search matches paths and old rename paths then keeps their ancestors` |
| S-04 点击目录 | 目录折叠后隐藏其子目录和文件，再次点击恢复 | manual：打开“当前变更” → 点击 `src` → 行内文件消失且箭头转为收起状态 → 再点一次恢复 |
| S-05 点击文件 | 原有 diff 请求、标题和返回行为不变 | manual：打开“当前变更” → 点击 `src/config.js` → diff 显示该文件 → 点击“返回文件列表”恢复树 |

## 状态回填

- [x] S-01 已验证：`npm test` 通过
- [x] S-02 已验证：`npm test` 通过
- [x] S-03 已验证：`npm test` 通过
- [x] S-04 已验证：DSH 实际界面折叠 `backend/src`，文件数由 4 变为 2
- [x] S-05 已验证：DSH 实际界面打开 `backend/src/config.js`，diff 正常显示
