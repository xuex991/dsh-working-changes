# 契约：查看历史提交内容 Diff

状态：已确认；日期：2026-11-03；来源：用户需求
北极星：点击历史 Commit 后，直接看到该 Commit 相对第一个父 Commit 的文件列表和
第一个文件的 diff。

## 目标

- 选中历史 Commit 后自动打开文件列表中的第一个变更文件并读取 diff。
- 文件列表继续展示该 Commit 相对第一个父 Commit 的完整变更文件树。
- diff 区域展示 Commit 标题、作者和时间，避免只看到文件路径而失去提交上下文。
- 点击文件列表中的其他文件时，在同位置切换到对应 diff。
- Commit 没有文件变更或 diff 读取失败时，显示明确状态，不隐藏文件列表。
- 保持只读，不执行 checkout、commit、push 或其他写操作。

## 用户行为场景

| 场景 | 期望 | 测试 |
|---|---|---|
| S-01 选择有多个文件变更的历史 Commit | 自动选中第一个文件并显示其 diff，右侧文件树同时显示全部变更文件 | manual：打开“当前变更”下拉 → 选择 Commit → 观察第一项文件高亮且 diff 已显示 |
| S-02 点击文件树中的其他文件 | diff 切换到该文件，Commit 上下文保持不变 | manual：选择 Commit → 点击第二个文件 → 文件标题和 diff 同时切换 |
| S-03 Commit 没有文件变更 | 文件列表显示空状态，不请求文件 diff | `test/operations.test.mjs::commit view returns no files for an empty commit` |
| S-04 返回当前变更 | 恢复当前未提交文件的文件树和 diff 选择 | manual：选择 Commit → 返回当前变更 → 当前文件列表重新出现 |

## 状态回填

- [x] S-01 已验证：DSH 实际界面选择 `backend · main · 10fa468` 后自动显示 `README.md` diff
- [x] S-02 已验证：DSH 实际界面点击 `src/config.js` 后，标题和 diff 同步切换
- [x] S-03 已验证：`npm test` 通过
- [x] S-04 已验证：DSH 实际界面点击“返回当前变更”后恢复 4 个当前文件
