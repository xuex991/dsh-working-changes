# QA：Working Changes 的可复现测试台

一个不依赖 GUI、可反复运行的测试目录。它做三件事：

1. **造夹具**：在系统临时目录（`$TMPDIR/dsh-working-changes-qa`）里生成一批真实 git 仓库，覆盖面板声称支持的每种场景
   （修改 / 暂存 / 未跟踪 / 删除 / 重命名 / 二进制 / 无换行结尾 / 中文与空格路径 /
   无提交仓库 / 多仓库工作区 / 工作区是子目录 / 合并冲突 / 大仓库）。
2. **跑断言**：直接调用插件的 `src/operations.js`，验证快照与 diff 的真实输出，
   不经过 DSH 界面。客户端行为用源码级契约检查兜底。
3. **出报告**：生成 `qa/report/report.html`（可直接用浏览器打开）和 `qa/BUGS.md`。

不会读写你自己的仓库：所有夹具都在系统临时目录下（默认
`$TMPDIR/dsh-working-changes-qa`，可用 `DSH_WC_FIXTURES` 覆盖），每次运行重建。
夹具不能放在 Git 仓库内——`operations` 会从 cwd 向上找仓库根，容器型夹具会被误判成单仓库。

## 跑

```bash
node qa/run.mjs              # 全量：夹具 → 断言 → 度量 → 报告
node qa/run.mjs --no-perf    # 跳过耗时度量（会少造一个 3300 文件的夹具）
node qa/run.mjs --only=A1    # 只跑一条用例，排查快
```

也可以 `pnpm run qa`（package.json 里的 `qa` 脚本）。

前置：Node ≥ 20（用到 `node:test` 之外的原生能力）、`git` 在 PATH 里。

## 看什么

| 文件 | 内容 |
|---|---|
| `report/report.html` | 主入口。顶部是 bug 一览，往下是断言结果、度量、代码观测 |
| `BUGS.md` | 同源生成的收敛清单：现象 / 成因 / 证据 / 修复方向 / 建议顺序 |
| `report/report.json` | 机器可读结果，便于以后接 CI |
| `bugs.mjs` | **单一事实来源**：改清单改这里，再重跑生成上面两份 |

## 三类结果

- **断言（A*）**：客观通过/失败。`FAIL` 表示问题此刻可复现；带「护栏」标记的是
  防止回归的既有正确行为，改动后必须保持 `PASS`。
- **度量（M*）**：数值，不用来卡门禁（机器差异大），关注量级与占比。
- **观测（O*）**：客户端逻辑无法在 Node 里跑，这里贴出触发点与关键源码，
  配合 `client.js` 行号阅读。

## 夹具一览

| 名字 | 场景 |
|---|---|
| `rich` | 单仓库，约 70 个变更：M/A/D/R、staged/unstaged/untracked、二进制、无 EOL、中文与空格路径、深层未跟踪目录 |
| `unborn` | `git init` 后没有任何 commit |
| `multi` | 容器工作区：`r1/`、`r2/` 两个独立仓库 + 非仓库目录 `plain/` |
| `subdir` | 工作区只是仓库的一个子目录（`packages/app`） |
| `conflict` | 合并冲突（`UU`）状态 |
| `big` | 300 个修改 + 3000 个未跟踪文件，只用于度量 |

夹具根目录不在插件仓库内：`git rev-parse --show-toplevel` 会从 cwd 向上找仓库根，
夹具若落在插件仓库里，`multi` 这种“容器工作区”会被误判成“工作区本身是仓库”。
`run.mjs` 启动时会先做这项前置检查。

## 加一条用例

在 `cases/*.mjs` 里追加：

```js
assertion({
  id: 'A19',
  bug: 'B5',        // 关联 bug，可为 null 表示纯护栏
  title: '一句话说明期望',
  async run() {
    const cwd = await fixture('rich')
    const ops = await operations()
    const snap = await ops.handle('snapshot', { cwd })
    return expect(snap.files.length > 0, '失败时展示的证据', '通过时的说明')
  },
})
```

然后 `node qa/run.mjs --only=A19`。

## 已知边界

- 断言只覆盖 `src/operations.js` + `src/git.js` 的真实行为；DSH 客户端（`lib/client.js`）
  在 Node 里没有 DOM / session runtime，只能用源码契约检查（A13–A18）。
- `conflict` 夹具依赖 `git merge` 的冲突输出，不会真的把文件切到冲突态之外。
- 度量里的绝对毫秒数受机器和磁盘缓存影响，跨机器比对时只看占比。
