# 契约：多仓库工作区

状态：已验证；日期：2026-11-03；来源：用户需求
北极星：工作区本身不是 Git 仓库、但包含多个独立仓库时，用户仍能看到所有改动并分别打开 diff。

## 目标

- 工作区根是仓库时保持原单仓库行为与兼容字段。
- 工作区根不是仓库时，默认发现一层并列子仓库。
- 每个文件标明所属仓库、仓库相对路径和工作区相对路径。
- 按仓库计算快照与 diff，一个仓库失败不隐藏其他仓库。
- 默认展示按仓库分组；Header 展示多仓库合计。
- 支持显式仓库清单、显示名映射、并发上限、单仓库超时和最大仓库数。
- 本次不做跨仓库连续 diff、Git 写操作、submodule 展开和无限深度扫描。

## 用户行为场景

| 场景 | 期望 | 测试 |
|---|---|---|
| S-01 容器工作区下有 3 个并列仓库，改动其中 2 个 | Header 为多仓库合计，列表出现 2 个仓库分组 | `test/operations.test.mjs::discovers sibling repositories and keeps each diff scoped to its repository` |
| S-02 同一路径分别存在于两个仓库 | 选择状态以仓库 ID + 路径区分，diff 使用对应仓库 tree | manual：三仓库工作区 → 分别点击 `frontend/src/app.js` 与 `backend/src/config.js` → 标题仓库名和 diff 均正确 |
| S-03 一个仓库损坏、其他仓库正常 | 正常仓库继续返回，损坏仓库带 error | `test/operations.test.mjs::one unreadable repository does not hide changes from other repositories` |
| S-04 仓库没有任何提交 | 使用空树基线，文件全部为新增 | `test/operations.test.mjs::repository without HEAD is treated as empty baseline and all files are additions` |
| S-05 配置显式仓库清单 | 清单外仓库不出现，显示名可覆盖 | `test/operations.test.mjs::explicit repository list disables automatic discovery` |
| S-06 未跟踪文件选择忽略 | 新文件不进入文件列表和合计 | `test/operations.test.mjs::untracked ignore mode leaves new files out of the snapshot` |
| S-07 工作区本身是仓库 | 原字段保留，并新增 `repos`、`workspace` | `test/operations.test.mjs::snapshot shows the workspace changes normally reported by git status` |

## 状态回填

- [x] S-01 已验证：9/9 单元测试通过
- [x] S-02 已验证：DSH 实际界面分别打开两个仓库的 diff
- [x] S-03 已验证
- [x] S-04 已验证
- [x] S-05 已验证
- [x] S-06 已验证
- [x] S-07 已验证
