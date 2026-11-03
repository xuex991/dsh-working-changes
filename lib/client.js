window.__ModuleLoader__.load({
  id: 'dsh-working-changes',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const {
      Fragment,
      useCallback,
      useEffect,
      useMemo,
      useRef,
      useState,
    } = React

    const NS = 'session-changes'
    const TAB_ID = 'dsh-working-changes/changes'
    const TAB_KIND = 'session-changes'
    const RPC_PATH = '/api/session-changes'
    const ZH = {
      'panel.title': '当前变更',
      'panel.open': '打开当前变更',
      'panel.guide': '查看当前未提交变更，或浏览所有本地分支的 Commit 历史。',
      'panel.current': '当前',
      'panel.history': '历史',
      'panel.currentChanges': '当前变更',
      'panel.selectRevision': '选择当前变更或历史 Commit',
      'panel.pickerCurrentHint': '{branch} · 未提交变更',
      'panel.pickerNoCommits': '这个分支还没有 Commit',
      'panel.noSessionBranches': '本 Session 暂无分支提交',
      'panel.pickerLoading': '正在加载分支和 Commit…',
      'panel.backToCurrent': '返回当前变更',
      'panel.historyGuide': '浏览本地分支的 Commit，并查看每个 Commit 相对父提交的变更。',
      'panel.loadingHistory': '正在读取本地分支历史…',
      'panel.historyError': '读取本地分支历史失败',
      'panel.localBranches': '本地分支',
      'panel.localBranchCount': '{n} 个本地分支',
      'panel.historySummary': '{repos} 个仓库 · {branches} 个本地分支',
      'panel.noLocalBranches': '没有本地分支',
      'panel.noLocalBranchesHint': '这个仓库还没有任何本地分支或提交。',
      'panel.branchCommits': '本 Session {n} 个提交',
      'panel.noSessionCommits': '本 Session 暂无提交',
      'panel.missingBaseline': '缺少本 Session 的历史基线，请刷新重试。',
      'panel.loadingCommits': '正在读取提交…',
      'panel.commitLoadError': '读取提交列表失败',
      'panel.commitsTruncated': '仅显示最新 {n} 个提交',
      'panel.branchesTruncated': '仅显示前 {n} 个本地分支',
      'panel.selectCommit': '选择 Commit 查看变更',
      'panel.selectCommitHint': '从右侧展开本地分支，然后选择一条 Commit。',
      'panel.selectCommitFile': '选择文件查看该 Commit 的 diff',
      'panel.selectCommitFileHint': '这里比较选中的 Commit 与其第一个父提交。',
      'panel.backToHistory': '返回历史',
      'panel.backToCommit': '返回提交文件',
      'panel.commitRoot': '根提交 · 与空树比较',
      'panel.commitMerge': 'Merge · 与第一个父提交比较',
      'panel.commitParent': '父提交 {sha}',
      'panel.commitNoFiles': '这个 Commit 没有文件变更',
      'panel.author': '作者',
      'panel.currentBranch': '当前',
      'panel.stateAll': '全部',
      'panel.stateStaged': '已暂存',
      'panel.stateUnstaged': '未暂存',
      'panel.stateUntracked': '未跟踪',
      'panel.stateConflicted': '冲突',
      'panel.stateStagedShort': '暂',
      'panel.stateUnstagedShort': '未',
      'panel.stateUntrackedShort': '新',
      'panel.stateConflictedShort': '冲',
      'panel.filterState': '按状态筛选',
      'panel.branch': '分支',
      'panel.baseline': '与 HEAD 比较',
      'panel.captureHint': '当前工作区相对 HEAD 没有未提交改动',
      'panel.refresh': '刷新',
      'panel.refreshing': '刷新中',
      'panel.files': '{n} 个文件',
      'panel.changedFiles': '{n} 个文件已更改',
      'panel.repositories': '{n} 个仓库',
      'panel.repoSummary': '{repos} 个仓库 · {files} 个文件',
      'panel.repoCountSummary': '{repos} 个仓库 · {files} 个文件已更改',
      'panel.partial': '部分仓库读取失败，其余仓库的变更仍可用。',
      'panel.truncatedRepos': '仓库数量超过上限，仅显示前 {n} 个。',
      'panel.allReposFailed': '所有仓库都无法读取',
      'panel.repoError': '无法读取仓库',
      'panel.noChanges': '无变更',
      'panel.changed': '变更',
      'panel.noChangesPill': '无未提交改动',
      'panel.moreFiles': '另外 {n} 个文件',
      'panel.loading': '正在读取 Session 变更…',
      'panel.selectFile': '选择文件查看 diff',
      'panel.selectHint': '这里比较 HEAD 与当前工作区，不涉及提交历史。',
      'panel.back': '返回文件列表',
      'panel.filter': '筛选文件',
      'panel.filterEmpty': '没有匹配的文件',
      'panel.changeTree': '已更改的文件',
      'panel.clearFilter': '清除筛选',
      'panel.expandDirectory': '展开目录',
      'panel.collapseDirectory': '收起目录',
      'panel.directoryFiles': '{n} 个文件',
      'panel.all': '全部',
      'panel.diff': 'Diff',
      'panel.additions': '新增',
      'panel.deletions': '删除',
      'panel.binary': '二进制文件',
      'panel.binaryHint': '该文件是二进制内容，无法显示文本 diff。',
      'panel.noTextDiff': '没有可显示的文本差异',
      'panel.noTextHint': '文件内容可能只发生了模式变化，或新增/删除的是空文件。',
      'panel.truncated': 'Diff 过长，仅显示前 {n} 个字符。',
      'panel.renamed': '由 {path} 重命名',
      'panel.noCwd': '这个 Session 没有工作目录',
      'panel.noCwdHint': '在项目里开始一个 Session 后再查看文件变更。',
      'panel.noSession': '没有选中的 Session',
      'panel.notRepo': '当前工作区不是 Git 仓库',
      'panel.notRepoHint': '当前工作区没有 Git 仓库，也没有发现包含 .git 的子仓库。',
      'panel.readError': '读取变更失败',
      'panel.retry': '重试',
      'panel.capturedAt': '相对 HEAD {hash}',
      'panel.detached': '游离 HEAD',
      'panel.statusM': '修改',
      'panel.statusA': '新增',
      'panel.statusD': '删除',
      'panel.statusR': '重命名',
      'panel.statusC': '复制',
      'panel.statusU': '冲突',
      'panel.statusOther': '变更',
      'panel.filesCount': '{n} 个文件',
      'panel.stats': '+{add} −{del}',
    }

    const EN = {
      'panel.title': 'Working Changes',
      'panel.open': 'Open working changes',
      'panel.guide': 'Inspect uncommitted changes or browse Commit history across local branches.',
      'panel.current': 'Current',
      'panel.history': 'History',
      'panel.currentChanges': 'Current changes',
      'panel.selectRevision': 'Choose current changes or a historical commit',
      'panel.pickerCurrentHint': '{branch} · uncommitted changes',
      'panel.pickerNoCommits': 'This branch has no commits yet',
      'panel.noSessionBranches': 'No branch commits in this session',
      'panel.pickerLoading': 'Loading branches and commits…',
      'panel.backToCurrent': 'Back to current changes',
      'panel.historyGuide': 'Browse commits on local branches and inspect each commit against its parent.',
      'panel.loadingHistory': 'Reading local branch history…',
      'panel.historyError': 'Could not read local branch history',
      'panel.localBranches': 'Local branches',
      'panel.localBranchCount': '{n} local branches',
      'panel.historySummary': '{repos} repositories · {branches} local branches',
      'panel.noLocalBranches': 'No local branches',
      'panel.noLocalBranchesHint': 'This repository has no local branches or commits yet.',
      'panel.branchCommits': '{n} session commits',
      'panel.noSessionCommits': 'No commits in this session',
      'panel.missingBaseline': 'The session history baseline is unavailable. Refresh to retry.',
      'panel.loadingCommits': 'Reading commits…',
      'panel.commitLoadError': 'Could not read commits',
      'panel.commitsTruncated': 'Showing the newest {n} commits',
      'panel.branchesTruncated': 'Showing the first {n} local branches',
      'panel.selectCommit': 'Select a commit to inspect its changes',
      'panel.selectCommitHint': 'Expand a local branch on the right, then select a commit.',
      'panel.selectCommitFile': 'Select a file to inspect this commit',
      'panel.selectCommitFileHint': 'The selected commit is compared with its first parent.',
      'panel.backToHistory': 'Back to history',
      'panel.backToCommit': 'Back to commit files',
      'panel.commitRoot': 'Root commit · compared with the empty tree',
      'panel.commitMerge': 'Merge · compared with the first parent',
      'panel.commitParent': 'Parent {sha}',
      'panel.commitNoFiles': 'This commit has no file changes',
      'panel.author': 'Author',
      'panel.currentBranch': 'current',
      'panel.stateAll': 'All',
      'panel.stateStaged': 'Staged',
      'panel.stateUnstaged': 'Unstaged',
      'panel.stateUntracked': 'Untracked',
      'panel.stateConflicted': 'Conflicted',
      'panel.stateStagedShort': 'S',
      'panel.stateUnstagedShort': 'W',
      'panel.stateUntrackedShort': 'U',
      'panel.stateConflictedShort': '!',
      'panel.filterState': 'Filter by state',
      'panel.branch': 'Branch',
      'panel.baseline': 'Compared with HEAD',
      'panel.captureHint': 'The workspace has no uncommitted changes from HEAD.',
      'panel.refresh': 'Refresh',
      'panel.refreshing': 'Refreshing',
      'panel.files': '{n} files',
      'panel.changedFiles': '{n} files changed',
      'panel.repositories': '{n} repositories',
      'panel.repoSummary': '{repos} repositories · {files} files',
      'panel.repoCountSummary': '{repos} repositories · {files} files changed',
      'panel.partial': 'Some repositories could not be read. Changes from the remaining repositories are still available.',
      'panel.truncatedRepos': 'The repository limit was reached; only the first {n} are shown.',
      'panel.allReposFailed': 'No repository could be read',
      'panel.repoError': 'Could not read repository',
      'panel.noChanges': 'No changes',
      'panel.changed': 'changes',
      'panel.noChangesPill': 'No uncommitted changes',
      'panel.moreFiles': '{n} more files',
      'panel.loading': 'Reading session changes…',
      'panel.selectFile': 'Select a file to inspect its diff',
      'panel.selectHint': 'HEAD and the current workspace are compared here.',
      'panel.back': 'Back to files',
      'panel.filter': 'Filter files',
      'panel.filterEmpty': 'No matching files',
      'panel.changeTree': 'Changed files',
      'panel.clearFilter': 'Clear filter',
      'panel.expandDirectory': 'Expand directory',
      'panel.collapseDirectory': 'Collapse directory',
      'panel.directoryFiles': '{n} files',
      'panel.all': 'All',
      'panel.diff': 'Diff',
      'panel.additions': 'additions',
      'panel.deletions': 'deletions',
      'panel.binary': 'Binary file',
      'panel.binaryHint': 'This file contains binary data, so no text diff is available.',
      'panel.noTextDiff': 'No text diff to display',
      'panel.noTextHint': 'Only the file mode changed, or an empty file was added or removed.',
      'panel.truncated': 'The diff is too large; only the first {n} characters are shown.',
      'panel.renamed': 'Renamed from {path}',
      'panel.noCwd': 'This Session has no working directory',
      'panel.noCwdHint': 'Start a Session in a project before inspecting file changes.',
      'panel.noSession': 'No Session is selected',
      'panel.notRepo': 'The current workspace is not a Git repository',
      'panel.notRepoHint': 'The workspace is not a Git repository and no child directory containing .git was found.',
      'panel.readError': 'Could not read changes',
      'panel.retry': 'Retry',
      'panel.capturedAt': 'Relative to HEAD {hash}',
      'panel.detached': 'detached HEAD',
      'panel.statusM': 'Modified',
      'panel.statusA': 'Added',
      'panel.statusD': 'Deleted',
      'panel.statusR': 'Renamed',
      'panel.statusC': 'Copied',
      'panel.statusU': 'Conflicted',
      'panel.statusOther': 'Changed',
      'panel.filesCount': '{n} files',
      'panel.stats': '+{add} −{del}',
    }

    let tr = (key) => key
    function text(key, vars) {
      let value = tr(key)
      if (vars) {
        for (const [name, replacement] of Object.entries(vars)) {
          value = value.replaceAll(`{${name}}`, String(replacement))
        }
      }
      return value
    }

    const STYLE = `
      .sc-root {
        --sc-blue: var(--dsw-alias-state-business-primary, #4d6bfe);
        --sc-ink: var(--dsw-alias-label-primary);
        --sc-dim: var(--dsw-alias-label-secondary);
        --sc-muted: var(--dsw-alias-label-tertiary);
        --sc-line: var(--dsw-alias-border-l1);
        --sc-line-strong: var(--dsw-alias-border-l2);
        --sc-base: var(--dsw-alias-bg-base);
        --sc-card: var(--dsw-alias-bg-layer-1);
        --sc-card-2: var(--dsw-alias-bg-layer-2);
        --sc-hover: var(--dsw-alias-interactive-bg-hover);
        --sc-ok: var(--dsw-alias-state-success-primary, #22a06b);
        --sc-warn: var(--dsw-alias-state-warn-primary, #d17b0f);
        --sc-err: var(--dsw-alias-state-error-primary, #d74646);
        --sc-blue-04: color-mix(in srgb, var(--sc-blue) 4%, transparent);
        --sc-blue-08: color-mix(in srgb, var(--sc-blue) 8%, transparent);
        --sc-blue-12: color-mix(in srgb, var(--sc-blue) 12%, transparent);
        --sc-blue-20: color-mix(in srgb, var(--sc-blue) 20%, transparent);
        --sc-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        background:
          radial-gradient(circle at 88% -8%, var(--sc-blue-12), transparent 30%),
          linear-gradient(180deg, var(--sc-blue-04), transparent 160px),
          var(--sc-base);
        color: var(--sc-ink);
        font-size: 12px;
        line-height: 1.5;
        container-type: inline-size;
      }
      .sc-root *, .sc-root *::before, .sc-root *::after { box-sizing: border-box; }
      .sc-header {
        flex: none;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 13px 14px 11px;
        border-bottom: 1px solid var(--sc-line);
        background: color-mix(in srgb, var(--sc-card) 92%, transparent);
      }
      .sc-headline { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .sc-title { font-size: 14px; font-weight: 700; letter-spacing: -.015em; white-space: nowrap; }
      .sc-modes {
        display: inline-flex; flex: none; padding: 2px; border-radius: 9px;
        border: 1px solid var(--sc-line); background: color-mix(in srgb, var(--sc-card-2) 72%, transparent);
      }
      .sc-modebtn {
        height: 23px; padding: 0 8px; border: 0; border-radius: 7px;
        background: transparent; color: var(--sc-muted); font: 600 10.5px/1 var(--sc-mono);
        cursor: pointer;
      }
      .sc-modebtn:hover { color: var(--sc-ink); background: var(--sc-hover); }
      .sc-modebtn:focus-visible { outline: 2px solid var(--sc-blue-20); }
      .sc-modebtn[data-active="true"] {
        background: var(--sc-base); color: var(--sc-blue);
        box-shadow: 0 1px 3px color-mix(in srgb, #000 9%, transparent);
      }
      .sc-picker { position: relative; flex: none; min-width: 0; }
      .sc-pickerbtn {
        display: inline-flex; align-items: center; gap: 6px; height: 27px;
        max-width: min(310px, 42vw); padding: 0 9px; border-radius: 8px;
        border: 1px solid var(--sc-line); background: var(--sc-base);
        color: var(--sc-dim); font: inherit; font-size: 10.5px; cursor: pointer;
      }
      .sc-pickerbtn:hover { background: var(--sc-hover); color: var(--sc-ink); border-color: var(--sc-line-strong); }
      .sc-pickerbtn:focus-visible { outline: 2px solid var(--sc-blue-20); outline-offset: 1px; }
      .sc-pickerbtn[data-history="true"] {
        border-color: var(--sc-blue-20); background: var(--sc-blue-04); color: var(--sc-blue);
      }
      .sc-pickerbtn .sc-pickerchevron {
        transform: rotate(0deg); transition: transform 140ms ease;
      }
      .sc-pickerbtn[aria-expanded="true"] .sc-pickerchevron {
        transform: rotate(180deg);
      }
      .sc-pickerlabel {
        min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        font: 600 10.5px/1.2 var(--sc-mono);
      }
      .sc-pickerpop {
        position: absolute; top: calc(100% + 7px); left: 0; z-index: 30;
        width: min(430px, calc(100vw - 44px)); max-height: min(470px, 68vh);
        overflow: auto; padding: 6px; border: 1px solid var(--sc-line-strong);
        border-radius: 12px; background: var(--sc-card); color: var(--sc-ink);
        box-shadow: 0 18px 44px color-mix(in srgb, #000 22%, transparent),
          0 3px 10px color-mix(in srgb, #000 8%, transparent);
      }
      .sc-pickercurrent {
        width: 100%; min-height: 46px; padding: 7px 9px; border: 0; border-radius: 8px;
        display: flex; align-items: center; gap: 9px; background: transparent;
        color: var(--sc-ink); text-align: left; cursor: pointer; font: inherit;
      }
      .sc-pickercurrent:hover, .sc-pickeritem:hover { background: var(--sc-hover); }
      .sc-pickercurrent:focus-visible, .sc-pickeritem:focus-visible {
        outline: 2px solid var(--sc-blue-20); outline-offset: -2px;
      }
      .sc-pickercurrent[data-selected="true"], .sc-pickeritem[data-selected="true"] {
        background: var(--sc-blue-12);
      }
      .sc-pickercurrenticon {
        width: 28px; height: 28px; flex: none; display: grid; place-items: center;
        border-radius: 8px; background: var(--sc-blue-08); color: var(--sc-blue);
      }
      .sc-pickercurrentcopy, .sc-pickeritemcopy { min-width: 0; flex: 1 1 auto; }
      .sc-pickercurrenttitle {
        color: var(--sc-ink); font-size: 11px; font-weight: 650;
      }
      .sc-pickercurrenthint, .sc-pickeritemsubject {
        margin-top: 2px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        color: var(--sc-muted); font-size: 9.5px;
      }
      .sc-pickerrepo {
        margin: 7px 4px 3px; padding: 5px 6px 3px; border-top: 1px solid var(--sc-line);
        color: var(--sc-dim); font-size: 10px; font-weight: 700;
      }
      .sc-pickeritem {
        width: 100%; min-height: 46px; padding: 6px 8px; border: 0; border-radius: 8px;
        display: flex; align-items: center; gap: 9px; background: transparent;
        color: var(--sc-ink); text-align: left; cursor: pointer; font: inherit;
      }
      .sc-pickerrevision {
        display: flex; align-items: center; gap: 6px; min-width: 0;
        color: var(--sc-ink); font: 600 10.5px/1.3 var(--sc-mono);
      }
      .sc-pickerbranch {
        min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        color: var(--sc-blue);
      }
      .sc-pickersha {
        flex: none; color: var(--sc-muted); font-weight: 550;
      }
      .sc-pickertime {
        margin-left: auto; flex: none; color: var(--sc-muted);
        font: 500 8.5px/1 var(--sc-mono);
      }
      .sc-pickerbranchhead {
        padding: 7px 9px 4px; display: flex; align-items: center; gap: 6px;
        color: var(--sc-dim); font: 650 9.5px/1.3 var(--sc-mono);
      }
      .sc-pickerbranchhead .sc-currenttag { margin-left: 0; }
      .sc-pickerloading {
        margin: 3px 8px 6px; padding: 8px; border-radius: 8px;
        background: var(--sc-card-2); color: var(--sc-muted); font-size: 9.5px;
      }
      .sc-branch {
        display: inline-flex; align-items: center; min-width: 0; max-width: 42%;
        height: 21px; padding: 0 8px; border-radius: 999px;
        border: 1px solid var(--sc-blue-20); background: var(--sc-blue-08);
        color: var(--sc-blue); font: 600 10.5px/1 var(--sc-mono);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .sc-spacer { flex: 1 1 auto; min-width: 4px; }
      .sc-iconbutton {
        width: 27px; height: 27px; padding: 0; border: 0; border-radius: 8px;
        display: inline-grid; place-items: center; flex: none;
        background: transparent; color: var(--sc-dim); cursor: pointer;
      }
      .sc-iconbutton:hover { background: var(--sc-hover); color: var(--sc-ink); }
      .sc-iconbutton:focus-visible { outline: 2px solid var(--sc-blue-20); outline-offset: 1px; }
      .sc-iconbutton:disabled { cursor: default; opacity: .55; }
      .sc-subline {
        display: flex; align-items: center; gap: 9px; min-width: 0;
        color: var(--sc-muted); font-size: 10.5px;
      }
      .sc-subline > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .sc-summary { display: inline-flex; align-items: center; gap: 8px; flex: none; font-variant-numeric: tabular-nums; }
      .sc-add { color: var(--sc-ok); font-weight: 650; }
      .sc-del { color: var(--sc-err); font-weight: 650; }
      .sc-workspace {
        flex: 1 1 0; min-height: 0; min-width: 0; display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(250px, .9fr);
      }
      .sc-listpane, .sc-detailpane { min-width: 0; min-height: 0; display: flex; flex-direction: column; }
      .sc-listpane {
        border-left: 1px solid var(--sc-line);
        background: color-mix(in srgb, var(--sc-card) 46%, transparent);
      }
      .sc-tools { flex: none; padding: 10px; border-bottom: 1px solid var(--sc-line); }
      .sc-searchbox { position: relative; min-width: 0; }
      .sc-searchicon {
        position: absolute; left: 9px; top: 50%; width: 14px; height: 14px;
        color: var(--sc-muted); transform: translateY(-50%); pointer-events: none;
      }
      .sc-search {
        width: 100%; height: 31px; padding: 0 31px 0 30px; border-radius: 9px;
        border: 1px solid var(--sc-line-strong); background: var(--sc-base); color: var(--sc-ink);
        font: inherit; font-size: 11.5px; outline: none;
      }
      .sc-search:focus { border-color: var(--sc-blue); box-shadow: 0 0 0 3px var(--sc-blue-08); }
      .sc-search::placeholder { color: var(--sc-muted); }
      .sc-searchclear {
        position: absolute; right: 6px; top: 50%; width: 22px; height: 22px;
        display: grid; place-items: center; padding: 0; border: 0; border-radius: 6px;
        background: transparent; color: var(--sc-muted); cursor: pointer;
        transform: translateY(-50%);
      }
      .sc-searchclear:hover { background: var(--sc-hover); color: var(--sc-ink); }
      .sc-searchclear:focus-visible { outline: 2px solid var(--sc-blue-20); }
      .sc-statefilters {
        display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
        padding-top: 8px; min-width: 0;
      }
      .sc-statefilter {
        height: 21px; padding: 0 7px; border-radius: 999px; cursor: pointer;
        border: 1px solid transparent; background: transparent; color: var(--sc-muted);
        font: 600 9.5px/1 var(--sc-mono); white-space: nowrap;
      }
      .sc-statefilter:hover { background: var(--sc-hover); color: var(--sc-ink); }
      .sc-statefilter:focus-visible { outline: 2px solid var(--sc-blue-20); }
      .sc-statefilter[data-active="true"] {
        border-color: var(--sc-blue-20); background: var(--sc-blue-08); color: var(--sc-blue);
      }
      .sc-listcaption {
        flex: none; display: flex; align-items: center; gap: 7px;
        min-height: 34px; padding: 7px 11px 5px; color: var(--sc-dim);
        font-size: 10.5px; font-weight: 650; letter-spacing: .01em;
      }
      .sc-listcaption::before {
        content: ""; width: 5px; height: 5px; border-radius: 2px;
        background: var(--sc-blue); box-shadow: 0 0 0 3px var(--sc-blue-08);
      }
      .sc-listcount {
        margin-left: auto; color: var(--sc-muted);
        font: 500 9.5px/1 var(--sc-mono); font-variant-numeric: tabular-nums;
      }
      .sc-filelist { flex: 1 1 0; min-height: 0; overflow: auto; padding: 0 0 14px; }
      .sc-filelist::-webkit-scrollbar, .sc-diffscroll::-webkit-scrollbar { width: 10px; height: 10px; }
      .sc-filelist::-webkit-scrollbar-thumb, .sc-diffscroll::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--sc-blue) 24%, transparent);
        border: 3px solid transparent; border-radius: 99px; background-clip: content-box;
      }
      .sc-tree { min-width: 0; }
      .sc-tree-row {
        width: calc(100% - 10px); min-height: 29px; margin: 1px 5px; padding: 3px 8px;
        display: flex; align-items: center; gap: 7px; border: 0; border-radius: 7px;
        background: transparent; color: var(--sc-ink); text-align: left; cursor: pointer;
        font: inherit;
      }
      .sc-tree-row:hover { background: var(--sc-hover); }
      .sc-tree-row:focus-visible { outline: 2px solid var(--sc-blue-20); outline-offset: -2px; }
      .sc-dirrow { color: var(--sc-dim); }
      .sc-dirrow:hover { color: var(--sc-ink); }
      .sc-chevron {
        width: 13px; height: 13px; flex: none; color: var(--sc-muted);
        transition: transform .12s ease;
      }
      .sc-chevron[data-open="false"] { transform: rotate(-90deg); }
      .sc-foldericon { width: 15px; height: 15px; flex: none; color: var(--sc-warn); }
      .sc-dirname {
        flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        font: 550 11.5px/1.4 var(--sc-mono);
      }
      .sc-dir-meta {
        flex: none; color: var(--sc-muted); font: 500 9px/1 var(--sc-mono);
        font-variant-numeric: tabular-nums;
      }
      .sc-dir-dot {
        width: 7px; height: 7px; flex: none; border-radius: 50%;
        background: var(--sc-blue); box-shadow: 0 0 0 3px var(--sc-blue-08);
      }
      .sc-dir-dot[data-status="A"] { background: var(--sc-ok); box-shadow: 0 0 0 3px color-mix(in srgb, var(--sc-ok) 10%, transparent); }
      .sc-dir-dot[data-status="D"], .sc-dir-dot[data-status="U"] {
        background: var(--sc-err); box-shadow: 0 0 0 3px color-mix(in srgb, var(--sc-err) 10%, transparent);
      }
      .sc-dir-dot[data-status="M"] { background: var(--sc-warn); box-shadow: 0 0 0 3px color-mix(in srgb, var(--sc-warn) 10%, transparent); }
      .sc-repo { min-width: 0; }
      .sc-repo + .sc-repo { margin-top: 5px; border-top: 1px solid var(--sc-line); padding-top: 5px; }
      .sc-repohead {
        width: 100%; min-height: 34px; padding: 5px 11px; display: flex; align-items: center; gap: 7px;
        border: 0; background: transparent; color: var(--sc-ink); text-align: left; cursor: pointer;
        font: inherit;
      }
      .sc-repohead:hover { background: var(--sc-hover); }
      .sc-repohead:focus-visible { outline: 2px solid var(--sc-blue-20); outline-offset: -2px; }
      .sc-reponame {
        flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        color: var(--sc-ink); font-size: 11.5px; font-weight: 700;
      }
      .sc-repobranch {
        min-width: 0; max-width: 35%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        color: var(--sc-muted); font: 500 9px/1.2 var(--sc-mono);
      }
      .sc-repostat {
        margin-left: auto; flex: none; color: var(--sc-muted);
        font: 500 9.5px/1 var(--sc-mono); font-variant-numeric: tabular-nums;
      }
      .sc-repohead[data-error="true"] .sc-reponame { color: var(--sc-err); }
      .sc-repoerror {
        margin: 5px 10px 8px; padding: 8px 9px; border-radius: 9px;
        border: 1px solid color-mix(in srgb, var(--sc-err) 24%, var(--sc-line));
        background: color-mix(in srgb, var(--sc-err) 7%, transparent);
        color: var(--sc-err); font-size: 10px; line-height: 1.55;
        overflow-wrap: anywhere;
      }
      .sc-filerow {
        min-height: 30px;
      }
      .sc-filerow[data-selected="true"] {
        background: var(--sc-blue-12);
        box-shadow: inset 2px 0 0 var(--sc-blue);
      }
      .sc-fileicon {
        width: 19px; height: 19px; flex: none; border-radius: 5px;
        display: inline-grid; place-items: center;
        background: var(--sc-blue-08); color: var(--sc-blue);
        font: 700 7.5px/1 var(--sc-mono); letter-spacing: -.02em;
      }
      .sc-fileicon[data-kind="js"] { background: color-mix(in srgb, #f2c94c 18%, transparent); color: #b48200; }
      .sc-fileicon[data-kind="ts"] { background: color-mix(in srgb, #3b82f6 14%, transparent); color: #2563c9; }
      .sc-fileicon[data-kind="html"] { background: color-mix(in srgb, #e76f51 14%, transparent); color: #b94d31; }
      .sc-fileicon[data-kind="css"] { background: color-mix(in srgb, #2aa7a1 14%, transparent); color: #167f7a; }
      .sc-fileicon[data-kind="json"] { background: color-mix(in srgb, #d4a72c 14%, transparent); color: #9a7605; }
      .sc-fileicon[data-kind="md"] { background: color-mix(in srgb, #5b8def 14%, transparent); color: #3e69bd; }
      .sc-fileicon[data-kind="py"] { background: color-mix(in srgb, #3572a5 14%, transparent); color: #28577d; }
      .sc-fileicon[data-kind="image"] { background: color-mix(in srgb, #22a06b 14%, transparent); color: #18794e; }
      .sc-fileicon[data-kind="shell"] { background: color-mix(in srgb, #7c8798 15%, transparent); color: #5d6878; }
      .sc-fileicon[data-kind="docker"] { background: color-mix(in srgb, #2496ed 14%, transparent); color: #1876bd; }
      .sc-fileicon[data-kind="lock"] { background: color-mix(in srgb, #8b949e 14%, transparent); color: #66717d; }
      .sc-status {
        width: 18px; height: 18px; border: 1px solid var(--sc-blue-20); border-radius: 5px; flex: none;
        display: inline-grid; place-items: center;
        background: var(--sc-blue-04); color: var(--sc-blue);
        font: 700 11px/1 var(--sc-mono);
      }
      .sc-status[data-status="M"] { color: var(--sc-blue); }
      .sc-status[data-status="A"] { border-color: color-mix(in srgb, var(--sc-ok) 30%, transparent); background: color-mix(in srgb, var(--sc-ok) 8%, transparent); color: var(--sc-ok); }
      .sc-status[data-status="D"], .sc-status[data-status="U"] { border-color: color-mix(in srgb, var(--sc-err) 30%, transparent); background: color-mix(in srgb, var(--sc-err) 8%, transparent); color: var(--sc-err); }
      .sc-name {
        flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        font: 500 11.5px/1.45 var(--sc-mono);
      }
      .sc-statebadges { display: inline-flex; flex: none; align-items: center; gap: 3px; }
      .sc-statebadge {
        min-width: 17px; height: 16px; padding: 0 4px; border-radius: 4px;
        display: inline-grid; place-items: center;
        border: 1px solid var(--sc-line); background: var(--sc-card-2);
        color: var(--sc-muted); font: 700 8.5px/1 var(--sc-mono);
      }
      .sc-statebadge[data-state="staged"] { color: var(--sc-ok); border-color: color-mix(in srgb, var(--sc-ok) 28%, transparent); }
      .sc-statebadge[data-state="unstaged"] { color: var(--sc-warn); border-color: color-mix(in srgb, var(--sc-warn) 28%, transparent); }
      .sc-statebadge[data-state="untracked"] { color: var(--sc-blue); border-color: var(--sc-blue-20); }
      .sc-statebadge[data-state="conflicted"] { color: var(--sc-err); border-color: color-mix(in srgb, var(--sc-err) 28%, transparent); }
      .sc-count {
        flex: none; color: var(--sc-muted); font: 500 9.5px/1 var(--sc-mono);
        font-variant-numeric: tabular-nums;
      }
      .sc-count .plus { color: var(--sc-ok); }
      .sc-count .minus { color: var(--sc-err); }
      .sc-detailpane {
        border-right: 1px solid var(--sc-line);
        background: color-mix(in srgb, var(--sc-base) 96%, var(--sc-card));
      }
      .sc-detailhead {
        flex: none; display: flex; align-items: center; gap: 7px; min-width: 0;
        min-height: 45px; padding: 7px 10px; border-bottom: 1px solid var(--sc-line);
        background: color-mix(in srgb, var(--sc-card) 78%, transparent);
      }
      .sc-back {
        display: none; height: 26px; padding: 0 8px; align-items: center; gap: 4px;
        border: 1px solid var(--sc-line-strong); border-radius: 8px;
        background: var(--sc-base); color: var(--sc-dim); font: inherit; cursor: pointer;
      }
      .sc-back:hover { background: var(--sc-hover); color: var(--sc-ink); }
      .sc-back[data-always="true"] { display: inline-flex; }
      .sc-detailtitle {
        flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        font: 600 11.5px/1.45 var(--sc-mono);
      }
      .sc-detailpath { color: var(--sc-muted); font-weight: 500; }
      .sc-detailstat { flex: none; font: 600 10px/1 var(--sc-mono); font-variant-numeric: tabular-nums; }
      .sc-commitmeta {
        flex: 1 1 0; min-height: 0; overflow: auto; padding: 24px 22px;
        display: flex; flex-direction: column; gap: 18px;
      }
      .sc-commitmeta-card {
        padding: 18px; border: 1px solid var(--sc-line); border-radius: 14px;
        background: color-mix(in srgb, var(--sc-card) 66%, transparent);
      }
      .sc-commitmeta-kicker {
        color: var(--sc-blue); font: 700 9.5px/1 var(--sc-mono);
        letter-spacing: .08em; text-transform: uppercase;
      }
      .sc-commitmeta-subject {
        margin-top: 9px; color: var(--sc-ink); font-size: 16px; font-weight: 650;
        line-height: 1.4; overflow-wrap: anywhere;
      }
      .sc-commitmeta-sha {
        margin-top: 10px; color: var(--sc-muted); font: 500 10.5px/1.4 var(--sc-mono);
        overflow-wrap: anywhere;
      }
      .sc-commitmeta-grid {
        margin-top: 16px; display: grid; grid-template-columns: max-content minmax(0, 1fr);
        gap: 8px 12px; color: var(--sc-muted); font-size: 10.5px;
      }
      .sc-commitmeta-grid strong { color: var(--sc-dim); font-weight: 600; }
      .sc-commitmeta-grid span { min-width: 0; overflow-wrap: anywhere; }
      .sc-empty-inline {
        padding: 18px; border: 1px dashed var(--sc-line-strong); border-radius: 12px;
        color: var(--sc-muted); text-align: center; font-size: 10.5px; line-height: 1.6;
      }
      .sc-history-repo { min-width: 0; }
      .sc-history-repo + .sc-history-repo {
        margin-top: 4px; padding-top: 4px; border-top: 1px solid var(--sc-line);
      }
      .sc-branchrow {
        width: calc(100% - 12px); min-height: 32px; margin: 1px 6px; padding: 4px 8px 4px 18px;
        display: flex; align-items: center; gap: 7px; border: 0; border-radius: 7px;
        background: transparent; color: var(--sc-ink); text-align: left; cursor: pointer; font: inherit;
      }
      .sc-branchrow:hover { background: var(--sc-hover); }
      .sc-branchrow:focus-visible { outline: 2px solid var(--sc-blue-20); outline-offset: -2px; }
      .sc-branchicon { width: 14px; height: 14px; flex: none; color: var(--sc-blue); }
      .sc-branchname {
        flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        font: 550 11px/1.4 var(--sc-mono);
      }
      .sc-currenttag {
        flex: none; padding: 2px 5px; border-radius: 999px;
        background: var(--sc-blue-08); color: var(--sc-blue); font: 600 8.5px/1 var(--sc-mono);
      }
      .sc-branchmeta {
        flex: none; color: var(--sc-muted); font: 500 9px/1 var(--sc-mono);
        font-variant-numeric: tabular-nums;
      }
      .sc-commitrow {
        width: calc(100% - 24px); min-height: 42px; margin: 1px 8px 1px 30px; padding: 6px 8px;
        display: grid; grid-template-columns: 62px minmax(0, 1fr); grid-template-rows: auto auto;
        column-gap: 8px; row-gap: 2px; border: 0; border-radius: 8px;
        background: transparent; color: var(--sc-ink); text-align: left; cursor: pointer; font: inherit;
      }
      .sc-commitrow:hover { background: var(--sc-hover); }
      .sc-commitrow:focus-visible { outline: 2px solid var(--sc-blue-20); outline-offset: -2px; }
      .sc-commitrow[data-selected="true"] {
        background: var(--sc-blue-12); box-shadow: inset 2px 0 0 var(--sc-blue);
      }
      .sc-commitsha {
        grid-row: 1 / 3; align-self: center; color: var(--sc-blue);
        font: 650 9.5px/1.3 var(--sc-mono);
      }
      .sc-commitsubject {
        min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        color: var(--sc-ink); font-size: 10.5px;
      }
      .sc-committime {
        color: var(--sc-muted); font: 500 8.5px/1.3 var(--sc-mono); font-variant-numeric: tabular-nums;
      }
      .sc-historynote {
        margin: 6px 10px 8px 30px; padding: 7px 8px; border-radius: 8px;
        color: var(--sc-muted); background: var(--sc-card-2); font-size: 9.5px; line-height: 1.5;
      }
      .sc-historynote[data-error="true"] { color: var(--sc-err); background: color-mix(in srgb, var(--sc-err) 7%, transparent); }
      .sc-commit-toolbar {
        flex: none; display: flex; align-items: center; gap: 7px; padding: 9px 10px;
        border-bottom: 1px solid var(--sc-line);
      }
      .sc-commit-toolbar-title {
        flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        color: var(--sc-dim); font: 600 10.5px/1.4 var(--sc-mono);
      }
      .sc-diffscroll { flex: 1 1 0; min-height: 0; overflow: auto; overscroll-behavior: contain; }
      .sc-diff { min-width: max-content; padding: 8px 0 24px; }
      .sc-hunk {
        margin: 9px 10px 4px; padding: 4px 9px; display: inline-block;
        max-width: calc(100% - 20px); border: 1px solid var(--sc-blue-20); border-radius: 999px;
        background: var(--sc-blue-08); color: var(--sc-blue);
        font: 500 10px/1.4 var(--sc-mono); white-space: pre-wrap;
      }
      .sc-lines { min-width: 100%; width: max-content; padding: 0 7px; font: 11.5px/1.62 var(--sc-mono); }
      .sc-line { display: flex; min-width: 100%; width: max-content; border-radius: 4px; }
      .sc-line.add { background: var(--dsw-alias-file-diff-added-bg, color-mix(in srgb, var(--sc-ok) 11%, transparent)); }
      .sc-line.del { background: var(--dsw-alias-file-diff-deleted-bg, color-mix(in srgb, var(--sc-err) 11%, transparent)); }
      .sc-ln {
        width: 37px; flex: none; padding-right: 7px; text-align: right;
        color: var(--sc-muted); opacity: .66; user-select: none; font-variant-numeric: tabular-nums;
      }
      .sc-line.add .sc-ln { background: var(--dsw-alias-file-diff-added-gutter, transparent); }
      .sc-line.del .sc-ln { background: var(--dsw-alias-file-diff-deleted-gutter, transparent); }
      .sc-sign { width: 15px; flex: none; text-align: center; font-weight: 700; user-select: none; }
      .sc-line.add .sc-sign { color: var(--dsw-alias-file-diff-added-marker, var(--sc-ok)); }
      .sc-line.del .sc-sign { color: var(--dsw-alias-file-diff-deleted-marker, var(--sc-err)); }
      .sc-code { flex: 1 1 auto; min-width: 0; padding-right: 14px; white-space: pre; }
      .sc-meta { padding: 1px 10px; color: var(--sc-muted); font: italic 10.5px/1.5 var(--sc-mono); }
      .sc-empty {
        flex: 1 1 0; min-height: 0; padding: 28px 22px;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 8px; text-align: center; color: var(--sc-dim);
      }
      .sc-empty-mark {
        width: 50px; height: 50px; display: grid; place-items: center; margin-bottom: 3px;
        border-radius: 16px; color: var(--sc-blue);
        background: linear-gradient(145deg, var(--sc-blue-12), var(--sc-blue-04));
        box-shadow: inset 0 0 0 1px var(--sc-blue-12);
      }
      .sc-empty-title { color: var(--sc-ink); font-size: 12.5px; font-weight: 650; }
      .sc-empty-hint { max-width: 330px; color: var(--sc-muted); font-size: 10.5px; line-height: 1.65; }
      .sc-retry {
        margin-top: 4px; height: 28px; padding: 0 12px; border-radius: 8px;
        border: 1px solid var(--sc-line-strong); background: var(--sc-base);
        color: var(--sc-ink); font: inherit; cursor: pointer;
      }
      .sc-retry:hover { border-color: var(--sc-blue); color: var(--sc-blue); }
      .sc-notice {
        flex: none; margin: 7px 10px 0; padding: 7px 9px; border-radius: 9px;
        border: 1px solid var(--sc-blue-20); background: var(--sc-blue-08);
        color: var(--sc-blue); font-size: 10.5px; line-height: 1.5;
      }
      .sc-spinner {
        width: 18px; height: 18px; border: 2px solid var(--sc-blue-20);
        border-top-color: var(--sc-blue); border-radius: 50%; animation: sc-spin .7s linear infinite;
      }
      @keyframes sc-spin { to { transform: rotate(360deg); } }
      .sc-headbtn {
        display: inline-flex; align-items: center; gap: 5px; height: 27px;
        padding: 0 9px; border-radius: 8px; border: 1px solid var(--sc-line);
        background: var(--sc-base); color: var(--sc-dim); font: inherit; font-size: 11px; cursor: pointer;
        white-space: nowrap;
      }
      .sc-headbtn:hover { background: var(--sc-hover); color: var(--sc-ink); border-color: var(--sc-line-strong); }
      .sc-headbtn:focus-visible { outline: 2px solid var(--sc-blue-20); outline-offset: 1px; }
      .sc-headbtn:disabled { opacity: .5; cursor: default; }
      .sc-headbtn svg { width: 13px; height: 13px; }
      .sc-headerbtn {
        display: inline-flex; align-items: center; gap: 7px; height: 31px;
        max-width: min(380px, 50vw); padding: 0 13px; border: 1px solid var(--sc-line);
        border-radius: 999px; background: color-mix(in srgb, var(--sc-base) 92%, transparent);
        color: var(--sc-dim); font: inherit; font-size: 12px; cursor: pointer; white-space: nowrap;
        box-shadow: 0 1px 2px color-mix(in srgb, #000 4%, transparent);
        transition: border-color .14s, background .14s, box-shadow .14s;
      }
      .sc-headerbtn:hover { background: var(--sc-base); color: var(--sc-ink); border-color: var(--sc-line-strong);
        box-shadow: 0 3px 10px color-mix(in srgb, #000 8%, transparent); }
      .sc-headerbtn:focus-visible { outline: 2px solid var(--sc-blue-20); outline-offset: 1px; }
      .sc-headerbtn[data-has-changes="true"] { color: var(--sc-ink); border-color: var(--sc-blue-20); background: var(--sc-blue-04); }
      .sc-headerwrap {
        --sc-blue: var(--dsw-alias-state-business-primary, #4d6bfe);
        --sc-ink: var(--dsw-alias-label-primary);
        --sc-dim: var(--dsw-alias-label-secondary);
        --sc-muted: var(--dsw-alias-label-tertiary);
        --sc-line: var(--dsw-alias-border-l1);
        --sc-line-strong: var(--dsw-alias-border-l2);
        --sc-base: var(--dsw-alias-bg-base);
        --sc-card: var(--dsw-alias-bg-layer-1);
        --sc-hover: var(--dsw-alias-interactive-bg-hover);
        --sc-ok: var(--dsw-alias-state-success-primary, #22a06b);
        --sc-err: var(--dsw-alias-state-error-primary, #d74646);
        --sc-blue-04: color-mix(in srgb, var(--sc-blue) 4%, transparent);
        --sc-blue-08: color-mix(in srgb, var(--sc-blue) 8%, transparent);
        --sc-blue-12: color-mix(in srgb, var(--sc-blue) 12%, transparent);
        --sc-blue-20: color-mix(in srgb, var(--sc-blue) 20%, transparent);
        --sc-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
        position: relative; display: inline-flex; z-index: 18;
      }
      .sc-headerbranch { max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
      .sc-headerstats { display: inline-flex; gap: 7px; font-variant-numeric: tabular-nums; }
      .sc-headerstats .up { color: var(--sc-ok); }
      .sc-headerstats .down { color: var(--sc-err); }
      .sc-hovercard {
        position: absolute; top: calc(100% + 8px); right: 0; z-index: 20;
        display: none; width: min(370px, 48vw); max-height: 340px; overflow: hidden;
        border: 1px solid var(--sc-line-strong); border-radius: 12px;
        background: var(--sc-card); color: var(--sc-ink);
        box-shadow: 0 16px 42px color-mix(in srgb, #000 20%, transparent),
          0 3px 10px color-mix(in srgb, #000 8%, transparent);
      }
      .sc-headerwrap[data-open="true"] .sc-hovercard { display: block; animation: sc-pop .14s ease; }
      .sc-hovercard::before {
        content: ""; position: absolute; top: -9px; left: 0; right: 0; height: 9px;
      }
      .sc-hoverhead {
        display: flex; align-items: center; gap: 7px; padding: 10px 12px;
        border-bottom: 1px solid var(--sc-line); color: var(--sc-dim); font-size: 11px;
      }
      .sc-hoverhead strong { color: var(--sc-ink); font-size: 11.5px; font-weight: 650; }
      .sc-hoverhead .stats { margin-left: auto; font: 600 10.5px/1 var(--sc-mono); font-variant-numeric: tabular-nums; }
      .sc-hoverlist { max-height: 286px; overflow: auto; padding: 5px 0; }
      .sc-hoverrepo {
        display: flex; align-items: center; gap: 6px; padding: 7px 12px 4px;
        color: var(--sc-dim); font-size: 10.5px; font-weight: 650;
      }
      .sc-hoverrepo span:last-child {
        min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        color: var(--sc-muted); font: 500 9.5px/1.2 var(--sc-mono);
      }
      .sc-hoverrepoerr {
        margin: 3px 10px 5px; padding: 6px 8px; border-radius: 8px;
        background: color-mix(in srgb, var(--sc-err) 7%, transparent);
        color: var(--sc-err); font-size: 10px; line-height: 1.45;
      }
      .sc-hoverrow {
        width: 100%; border: 0; background: transparent; color: var(--sc-ink);
        display: flex; align-items: center; gap: 8px; min-height: 34px;
        padding: 4px 12px; text-align: left; cursor: pointer; font: inherit;
      }
      .sc-hoverrow:hover { background: var(--sc-hover); }
      .sc-hoverrow:focus-visible { outline: 2px solid var(--sc-blue-20); outline-offset: -2px; }
      .sc-hovername {
        flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        font-size: 11.5px;
      }
      .sc-hoverstat {
        flex: none; font: 600 10.5px/1 var(--sc-mono); font-variant-numeric: tabular-nums;
      }
      .sc-hoverempty { padding: 22px 16px; text-align: center; color: var(--sc-muted); font-size: 11px; }
      .sc-hovermore { padding: 5px 12px 7px; color: var(--sc-muted); font-size: 10.5px; }
      @keyframes sc-pop { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }
      @container (max-width: 540px) {
        .sc-workspace { grid-template-columns: minmax(0, 1fr); }
        .sc-workspace[data-detail="true"] { grid-template-rows: minmax(0, 1fr); }
        .sc-workspace[data-detail="true"] .sc-listpane { display: none; }
        .sc-workspace[data-detail="false"] .sc-detailpane { display: none; }
        .sc-workspace[data-detail="true"] .sc-detailpane { display: flex; }
        .sc-listpane, .sc-detailpane { border-left: 0; border-right: 0; }
        .sc-back { display: inline-flex; }
      }
      @media (prefers-reduced-motion: reduce) {
        .sc-spinner { animation-duration: 1.6s; }
      .sc-headerwrap[data-open="true"] .sc-hovercard { animation: none; }
      }
    `

    function BranchIcon({ size = 16 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
        h('circle', { cx: 6, cy: 5, r: 2.5 }),
        h('circle', { cx: 6, cy: 19, r: 2.5 }),
        h('circle', { cx: 18, cy: 7, r: 2.5 }),
        h('path', { d: 'M6 7.5v9M18 9.5c0 4-3 5.5-7 6.5' }))
    }

    function RefreshIcon() {
      return h('svg', {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.9,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      }, h('path', { d: 'M20 7v5h-5M4 17v-5h5M6.4 8.2A7 7 0 0 1 18.8 7M17.6 15.8A7 7 0 0 1 5.2 17' }))
    }

    function BackIcon() {
      return h('svg', {
        width: 13,
        height: 13,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      }, h('path', { d: 'm15 18-6-6 6-6' }))
    }

    function ChevronIcon({ open, className }) {
      return h('svg', {
        className: ['sc-chevron', className].filter(Boolean).join(' '),
        'data-open': String(open),
        viewBox: '0 0 16 16',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      }, h('path', { d: 'm4 6 4 4 4-4' }))
    }

    function SearchIcon() {
      return h('svg', {
        className: 'sc-searchicon',
        viewBox: '0 0 16 16',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        'aria-hidden': 'true',
      },
        h('circle', { cx: 7, cy: 7, r: 4.25 }),
        h('path', { d: 'm10.2 10.2 3 3' }))
    }

    function CloseIcon() {
      return h('svg', {
        width: 12,
        height: 12,
        viewBox: '0 0 16 16',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        'aria-hidden': 'true',
      }, h('path', { d: 'm4 4 8 8M12 4l-8 8' }))
    }

    function FolderIcon() {
      return h('svg', {
        className: 'sc-foldericon',
        viewBox: '0 0 20 20',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
        h('path', { d: 'M2.5 5.5h5l1.4 1.7h8.6v7.6a1.7 1.7 0 0 1-1.7 1.7H4.2a1.7 1.7 0 0 1-1.7-1.7V5.5Z' }),
        h('path', { d: 'M2.5 7.2h15' }))
    }

    function fileKind(path) {
      const name = String(path || '').split('/').pop().toLowerCase()
      const extension = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1) : ''
      if (name === 'dockerfile' || name.startsWith('dockerfile.')) return 'docker'
      if (name === 'makefile') return 'shell'
      if (name.endsWith('.lock') || name.includes('lock.')) return 'lock'
      if (['js', 'jsx', 'mjs', 'cjs'].includes(extension)) return 'js'
      if (['ts', 'tsx', 'mts', 'cts'].includes(extension)) return 'ts'
      if (['html', 'htm', 'vue', 'svelte'].includes(extension)) return 'html'
      if (['css', 'scss', 'sass', 'less'].includes(extension)) return 'css'
      if (['json', 'jsonc', 'json5'].includes(extension)) return 'json'
      if (['md', 'mdx', 'markdown'].includes(extension)) return 'md'
      if (['py', 'pyw'].includes(extension)) return 'py'
      if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'avif'].includes(extension)) return 'image'
      if (['sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd'].includes(extension)) return 'shell'
      return 'file'
    }

    function fileBadge(path) {
      const kind = fileKind(path)
      if (kind === 'js') return 'JS'
      if (kind === 'ts') return 'TS'
      if (kind === 'html') return '<>'
      if (kind === 'css') return '#'
      if (kind === 'json') return '{}'
      if (kind === 'md') return 'MD'
      if (kind === 'py') return 'PY'
      if (kind === 'image') return 'IMG'
      if (kind === 'shell') return '>_'
      if (kind === 'docker') return 'DK'
      if (kind === 'lock') return 'LK'
      return '·'
    }

    function FileTypeIcon({ path }) {
      return h('span', {
        className: 'sc-fileicon',
        'data-kind': fileKind(path),
        'aria-hidden': 'true',
      }, fileBadge(path))
    }

    function statusMark(status) {
      if (status === 'A') return '+'
      if (status === 'D') return '−'
      if (status === 'R') return '→'
      if (status === 'U') return '!'
      if (status === 'C') return '='
      return '•'
    }

    function bnClass(status) {
      return ['M', 'A', 'D', 'R', 'C', 'U'].includes(status) ? status : 'O'
    }

    function fileKey(file) {
      return `${file.repoId || '.'}\u0000${file.path}`
    }

    function repoForFile(data, file) {
      if (!file) return null
      return (data?.repos || []).find((repo) => repo.id === file.repoId) || null
    }

    function isMultiRepo(data) {
      return Boolean(data?.workspace?.multiRepo || (data?.repos?.length || 0) > 1)
    }

    function repoDisplayName(repo) {
      return repo?.name || repo?.relPath || '.'
    }

    function statusLabel(status) {
      if (status === 'M') return text('panel.statusM')
      if (status === 'A') return text('panel.statusA')
      if (status === 'D') return text('panel.statusD')
      if (status === 'R') return text('panel.statusR')
      if (status === 'C') return text('panel.statusC')
      if (status === 'U') return text('panel.statusU')
      return text('panel.statusOther')
    }

    function changeCountLabel(summary) {
      if (!summary || summary.files === 0) return text('panel.noChanges')
      return text('panel.files', { n: summary.files })
    }

    function fileStateLabel(state) {
      if (state === 'staged') return text('panel.stateStaged')
      if (state === 'unstaged') return text('panel.stateUnstaged')
      if (state === 'untracked') return text('panel.stateUntracked')
      if (state === 'conflicted') return text('panel.stateConflicted')
      return state
    }

    function fileStateShort(state) {
      if (state === 'staged') return text('panel.stateStagedShort')
      if (state === 'unstaged') return text('panel.stateUnstagedShort')
      if (state === 'untracked') return text('panel.stateUntrackedShort')
      if (state === 'conflicted') return text('panel.stateConflictedShort')
      return ''
    }

    function stateCounts(files) {
      const counts = { all: files.length, staged: 0, unstaged: 0, untracked: 0, conflicted: 0 }
      for (const file of files) {
        for (const state of file.states || []) {
          if (Object.hasOwn(counts, state)) counts[state] += 1
        }
      }
      return counts
    }

    function branchHistoryKey(repoId, branch) {
      return `${repoId || '.'}\u0000${branch || ''}`
    }

    function captureHistoryBaselines(baselines, history) {
      const next = { ...(baselines || {}) }
      for (const repo of history?.repos || []) {
        for (const branch of repo.branches || []) {
          const key = branchHistoryKey(repo.id, branch.name)
          if (branch.sha && !Object.hasOwn(next, key)) next[key] = branch.sha
        }
      }
      return next
    }

    function isSessionBranch(baselines, branch) {
      const baseline = baselines?.[branchHistoryKey(branch.repoId, branch.name)]
      return Boolean(baseline && baseline !== branch.sha)
    }

    function historyBaselinesStorageKey(sessionId, cwd) {
      return `${NS}:history-baselines:${sessionId}:${cwd}`
    }

    function readHistoryBaselines(sessionId, cwd) {
      try {
        const raw = sessionStorage.getItem(historyBaselinesStorageKey(sessionId, cwd))
        const value = raw ? JSON.parse(raw) : null
        return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
      } catch {
        return {}
      }
    }

    function writeHistoryBaselines(sessionId, cwd, baselines) {
      try {
        sessionStorage.setItem(
          historyBaselinesStorageKey(sessionId, cwd),
          JSON.stringify(baselines),
        )
      } catch {
        // Session storage is an optional reload aid; in-memory state remains authoritative.
      }
    }

    function commitKey(repoId, branch, sha) {
      return `${branchHistoryKey(repoId, branch)}\u0000${sha || ''}`
    }

    function formatCommitTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp * 1000)
      if (Number.isNaN(date.getTime())) return ''
      return date.toLocaleString(undefined, {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    }

    function shortSha(sha) {
      return String(sha || '').slice(0, 7)
    }

    function Stat({ summary }) {
      if (!summary || summary.files === 0) return null
      return h('span', {
        className: 'sc-summary',
        title: `${text('panel.additions')} ${summary.additions}, ${text('panel.deletions')} ${summary.deletions}`,
      },
        h('span', { className: 'sc-add' }, `+${summary.additions}`),
        h('span', null, h('span', { className: 'sc-del' }, `−${summary.deletions}`)))
    }

    function EmptyState({ title, hint, retry, children }) {
      return h('div', { className: 'sc-empty' },
        h('div', { className: 'sc-empty-mark' }, h(BranchIcon, { size: 25 })),
        h('div', { className: 'sc-empty-title' }, title),
        hint ? h('div', { className: 'sc-empty-hint' }, hint) : null,
        retry ? h('button', { type: 'button', className: 'sc-retry', onClick: retry }, text('panel.retry')) : null,
        children)
    }

    async function rpc(op, params) {
      let response
      try {
        response = await fetch(RPC_PATH, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ op, ...params }),
        })
      } catch (error) {
        const failure = new Error(error?.message || String(error))
        failure.code = 'transport'
        throw failure
      }
      let body
      try {
        body = await response.json()
      } catch {
        throw new Error(`Session Changes returned invalid JSON (HTTP ${response.status}).`)
      }
      if (!body || body.ok !== true) {
        const error = new Error(body?.error?.message || `Session Changes failed (HTTP ${response.status}).`)
        error.code = body?.error?.code || 'internal'
        throw error
      }
      return body.data
    }

    function createStore(initial) {
      let state = initial
      let listeners = []
      return {
        get: () => state,
        set(patch) {
          const next = typeof patch === 'function' ? patch(state) : patch
          const merged = { ...state, ...next }
          if (merged === state) return
          state = merged
          for (const listener of listeners) listener()
        },
        subscribe(listener) {
          listeners.push(listener)
          return () => {
            listeners = listeners.filter((item) => item !== listener)
          }
        },
      }
    }

    function useStore(store) {
      const [state, setState] = useState(store.get())
      useEffect(() => {
        const off = store.subscribe(() => setState(store.get()))
        setState(store.get())
        return off
      }, [store])
      return state
    }

    function useSessionSummary(sessions, sessionId) {
      const [summary, setSummary] = useState(null)
      useEffect(() => {
        if (!sessions || !sessionId) {
          setSummary(null)
          return undefined
        }
        const read = () => setSummary(sessions.list.getSnapshot().byId[sessionId] || null)
        read()
        return sessions.list.subscribe(read)
      }, [sessions, sessionId])
      return summary
    }

    const controllers = new Map()

    function controllerFor(ctx, sessionId) {
      if (!sessionId) return null
      let controller = controllers.get(sessionId)
      if (controller) return controller

      const store = createStore({
        cwd: null,
        mode: 'current',
        loading: false,
        refreshing: false,
        data: null,
        error: null,
        selected: null,
        diff: null,
        diffLoading: false,
        diffError: null,
        historyData: null,
        historyLoading: false,
        historyError: null,
        historyLoaded: false,
        historyBaselines: {},
        branchCommits: {},
        selectedCommit: null,
        commitData: null,
        commitLoading: false,
        commitError: null,
        commitFile: null,
        commitDiff: null,
        commitDiffLoading: false,
        commitDiffError: null,
      })
      let watchers = 0
      let offSession = null
      let offFocus = null
      let refreshTimer = null
      let loadSequence = 0
      let diffSequence = 0
      let historySequence = 0
      let commitSequence = 0
      let commitDiffSequence = 0

      function set(patch) {
        store.set(patch)
      }

      function installSessionWatch() {
        if (offSession) return
        const binding = ctx.sessions.binding(sessionId)
        const source = binding?.session
        if (!source) return
        let previous = Boolean(source.getSnapshot()?.running)
        offSession = source.subscribe(() => {
          const running = Boolean(source.getSnapshot()?.running)
          if (previous && !running) {
            if (refreshTimer) clearTimeout(refreshTimer)
            refreshTimer = setTimeout(() => {
              refreshTimer = null
              void refresh()
            }, 180)
          }
          previous = running
        })
      }

      async function loadDiff(file, data, token) {
        const repo = repoForFile(data, file)
        const baselineTree = repo?.baselineTree || data?.baseline?.tree
        const currentTree = repo?.currentTree || data?.current
        const repoRoot = repo?.root || data?.repo?.root
        const cwd = data?.workspace?.root || data?.repo?.root
        if (!file || !cwd || !repoRoot || !baselineTree || !currentTree) {
          set({ diff: null, diffLoading: false, diffError: null })
          return
        }
        set({ diffLoading: true, diffError: null })
        const selectedKey = fileKey(file)
        try {
          const diff = await rpc('diff', {
            cwd,
            repoRoot,
            baselineTree,
            currentTree,
            path: file.path,
          })
          if (token !== diffSequence || store.get().selected !== selectedKey) return
          set({ diff, diffLoading: false })
        } catch (error) {
          if (token !== diffSequence || store.get().selected !== selectedKey) return
          set({ diff: null, diffLoading: false, diffError: error.message })
        }
      }

      async function refresh() {
        const cwd = store.get().cwd
        if (!cwd) return
        const token = ++loadSequence
        set({
          loading: !store.get().data,
          refreshing: Boolean(store.get().data),
          error: null,
        })
        try {
          const data = await rpc('snapshot', { cwd })
          if (token !== loadSequence || store.get().cwd !== cwd) return
          const selected = store.get().selected
          const selectedFile = selected
            ? data.files.find((file) => fileKey(file) === selected)
            : null
          set({
            loading: false,
            refreshing: false,
            data,
            error: null,
            selected: selectedFile ? selected : null,
            diff: selectedFile ? store.get().diff : null,
            diffError: null,
          })
          if (selectedFile) void loadDiff(selectedFile, data, ++diffSequence)
        } catch (error) {
          if (token !== loadSequence || store.get().cwd !== cwd) return
          set({ loading: false, refreshing: false, error: error.message })
        }
        if (store.get().historyLoaded || store.get().mode === 'history') {
          void loadHistory()
        }
      }

      async function loadHistory() {
        const cwd = store.get().cwd
        if (!cwd || store.get().historyLoading) return
        const token = ++historySequence
        set({
          historyLoading: true,
          historyError: null,
        })
        try {
          const data = await rpc('history', { cwd })
          if (token !== historySequence || store.get().cwd !== cwd) return
          const selected = store.get().selectedCommit
          const selectedRepo = selected
            ? data.repos.find((repo) => repo.id === selected.repoId)
            : null
          const selectedExists = selectedRepo?.branches.some((branch) => (
            branch.name === selected.branch
          ))
          const historyBaselines = captureHistoryBaselines(
            store.get().historyBaselines,
            data,
          )
          writeHistoryBaselines(sessionId, cwd, historyBaselines)
          set({
            historyData: data,
            historyLoading: false,
            historyError: null,
            historyLoaded: true,
            historyBaselines,
            branchCommits: {},
            selectedCommit: selectedExists ? selected : null,
            commitData: selectedExists ? store.get().commitData : null,
            commitFile: selectedExists ? store.get().commitFile : null,
            commitDiff: selectedExists ? store.get().commitDiff : null,
          })
        } catch (error) {
          if (token !== historySequence || store.get().cwd !== cwd) return
          set({ historyLoading: false, historyError: error.message })
        }
      }

      function setMode(mode) {
        if (mode !== 'current' && mode !== 'history') return
        set({ mode })
        if (mode === 'history' && !store.get().historyLoaded) void loadHistory()
      }

      async function loadCommits(repoId, branch) {
        const history = store.get().historyData
        const repo = history?.repos.find((item) => item.id === repoId)
        const key = branchHistoryKey(repoId, branch)
        const existing = store.get().branchCommits[key]
        const baseline = store.get().historyBaselines[key]
        if (!repo || existing?.loading) return
        if (!baseline) {
          set((current) => ({
            branchCommits: {
              ...current.branchCommits,
              [key]: {
                loading: false,
                error: text('panel.missingBaseline'),
                data: existing?.data || null,
              },
            },
          }))
          return
        }
        set((current) => ({
          branchCommits: {
            ...current.branchCommits,
            [key]: {
              loading: true,
              error: null,
              data: existing?.data || null,
            },
          },
        }))
        try {
          const data = await rpc('commits', {
            cwd: store.get().cwd,
            repoRoot: repo.root,
            branch,
            baseline,
          })
          if (store.get().cwd !== history.workspace.root) return
          set((current) => ({
            branchCommits: {
              ...current.branchCommits,
              [key]: { loading: false, error: null, data },
            },
          }))
        } catch (error) {
          if (store.get().cwd !== history.workspace.root) return
          set((current) => ({
            branchCommits: {
              ...current.branchCommits,
              [key]: { loading: false, error: error.message, data: existing?.data || null },
            },
          }))
        }
      }

      async function selectCommit(repoId, branch, commit) {
        const history = store.get().historyData
        const repo = history?.repos.find((item) => item.id === repoId)
        if (!repo || !commit?.sha) return
        const token = ++commitSequence
        commitDiffSequence += 1
        const selectedCommit = {
          repoId,
          repoRoot: repo.root,
          repoName: repoDisplayName(repo),
          branch,
          sha: commit.sha,
          shortSha: shortSha(commit.sha),
          subject: commit.subject,
          timestamp: commit.timestamp,
        }
        set({
          mode: 'history',
          selectedCommit,
          commitData: null,
          commitLoading: true,
          commitError: null,
          commitFile: null,
          commitDiff: null,
          commitDiffLoading: false,
          commitDiffError: null,
        })
        try {
          const data = await rpc('commit', {
            cwd: store.get().cwd,
            repoRoot: repo.root,
            commit: commit.sha,
          })
          if (token !== commitSequence || store.get().selectedCommit?.sha !== commit.sha) return
          const files = data.files.map((file) => ({
            ...file,
            repoId,
            repoName: repoDisplayName(repo),
            repoPath: file.path,
            relPath: file.path,
            states: [],
          }))
          set({
            commitData: { ...data, files },
            commitLoading: false,
            commitError: null,
          })
        } catch (error) {
          if (token !== commitSequence || store.get().selectedCommit?.sha !== commit.sha) return
          set({ commitData: null, commitLoading: false, commitError: error.message })
        }
      }

      async function selectCommitFile(file) {
        const state = store.get()
        const data = state.commitData
        const selected = state.selectedCommit
        if (!data || !selected || !file) return
        const token = ++commitDiffSequence
        set({
          commitFile: file.path,
          commitDiff: null,
          commitDiffLoading: true,
          commitDiffError: null,
        })
        try {
          const diff = await rpc('diff', {
            cwd: store.get().cwd,
            repoRoot: selected.repoRoot,
            baselineTree: data.baselineTree,
            currentTree: data.currentTree,
            path: file.path,
          })
          if (token !== commitDiffSequence || store.get().commitFile !== file.path) return
          set({ commitDiff: diff, commitDiffLoading: false })
        } catch (error) {
          if (token !== commitDiffSequence || store.get().commitFile !== file.path) return
          set({ commitDiff: null, commitDiffLoading: false, commitDiffError: error.message })
        }
      }

      function clearCommitFile() {
        commitDiffSequence += 1
        set({
          commitFile: null,
          commitDiff: null,
          commitDiffLoading: false,
          commitDiffError: null,
        })
      }

      function backToHistory() {
        commitSequence += 1
        commitDiffSequence += 1
        set({
          selectedCommit: null,
          commitData: null,
          commitLoading: false,
          commitError: null,
          commitFile: null,
          commitDiff: null,
          commitDiffLoading: false,
          commitDiffError: null,
        })
      }

      function showCurrent() {
        commitSequence += 1
        commitDiffSequence += 1
        set({
          mode: 'current',
          selectedCommit: null,
          commitData: null,
          commitLoading: false,
          commitError: null,
          commitFile: null,
          commitDiff: null,
          commitDiffLoading: false,
          commitDiffError: null,
        })
      }

      function setCwd(cwd) {
        if (store.get().cwd === cwd) {
          if (cwd && !store.get().data && !store.get().loading) void refresh()
          return
        }
        loadSequence += 1
        diffSequence += 1
        historySequence += 1
        commitSequence += 1
        commitDiffSequence += 1
        set({
          cwd: cwd || null,
          mode: 'current',
          loading: false,
          refreshing: false,
          data: null,
          error: null,
          selected: null,
          diff: null,
          diffLoading: false,
          diffError: null,
          historyData: null,
          historyLoading: false,
          historyError: null,
          historyLoaded: false,
          historyBaselines: cwd ? readHistoryBaselines(sessionId, cwd) : {},
          branchCommits: {},
          selectedCommit: null,
          commitData: null,
          commitLoading: false,
          commitError: null,
          commitFile: null,
          commitDiff: null,
          commitDiffLoading: false,
          commitDiffError: null,
        })
        if (cwd) {
          void refresh()
          void loadHistory()
        }
      }

      function select(target) {
        const current = store.get().data
        const file = typeof target === 'string'
          ? current?.files.find((item) => fileKey(item) === target)
          : target
        if (!file) return
        const selectedKey = fileKey(file)
        const diffToken = ++diffSequence
        set({ selected: selectedKey, diff: null, diffError: null, diffLoading: false })
        if (current) void loadDiff(file, current, diffToken)
      }

      function clearSelection() {
        diffSequence += 1
        set({ selected: null, diff: null, diffError: null, diffLoading: false })
      }

      function watch() {
        watchers += 1
        if (watchers === 1) {
          installSessionWatch()
          if (typeof window !== 'undefined') {
            const onFocus = () => void refresh()
            window.addEventListener('focus', onFocus)
            offFocus = () => window.removeEventListener('focus', onFocus)
          }
        }
        return () => {
          watchers = Math.max(0, watchers - 1)
          if (watchers > 0) return
          offSession?.()
          offSession = null
          offFocus?.()
          offFocus = null
          if (refreshTimer) clearTimeout(refreshTimer)
          refreshTimer = null
        }
      }

      controller = {
        sessionId,
        store,
        setCwd,
        refresh,
        loadHistory,
        setMode,
        loadCommits,
        selectCommit,
        selectCommitFile,
        clearCommitFile,
        backToHistory,
        showCurrent,
        select,
        clearSelection,
        watch,
      }
      controllers.set(sessionId, controller)
      return controller
    }

    function useSessionController(ctx, sessionId) {
      const controller = useMemo(() => controllerFor(ctx, sessionId), [ctx, sessionId])
      const summary = useSessionSummary(ctx.sessions, sessionId)
      const cwd = summary?.cwd || null
      const state = useStore(controller.store)

      useEffect(() => controller.watch(), [controller])
      useEffect(() => {
        controller.setCwd(cwd)
      }, [controller, cwd])

      return { controller, state, summary, cwd }
    }

    function HeaderButton({ ctx, sessionId }) {
      const { controller, state } = useSessionController(ctx, sessionId)
      const data = state.data
      const repo = data?.repo
      const repos = data?.repos || []
      const changedRepos = repos.filter((item) => item.files.length > 0)
      const failedRepos = repos.filter((item) => item.error)
      const multi = isMultiRepo(data)
      const summary = data?.summary
      const hasChanges = Boolean(summary && summary.files > 0)
      const branch = !multi
        ? (repo?.branch || (repo?.detached ? text('panel.detached') : null))
        : null
      const label = hasChanges
        ? multi
          ? text('panel.repoCountSummary', {
              repos: changedRepos.length,
              files: summary.files,
            })
          : text('panel.changedFiles', { n: summary.files })
        : repo?.isRepo
          ? text('panel.noChangesPill')
          : multi && repos.length > 0
            ? text('panel.repositories', { n: repos.length })
            : text('panel.title')
      const files = data?.files || []
      const visibleFiles = files.slice(0, 12)

      const [open, setOpen] = useState(false)
      const closeTimer = useRef(null)
      useEffect(() => () => {
        if (closeTimer.current) clearTimeout(closeTimer.current)
      }, [])

      function scheduleOpen(value) {
        if (closeTimer.current) clearTimeout(closeTimer.current)
        closeTimer.current = setTimeout(() => setOpen(value), value ? 90 : 140)
      }

      function openPanel(file, event) {
        event?.currentTarget?.blur()
        setOpen(false)
        if (closeTimer.current) clearTimeout(closeTimer.current)
        if (file) controller.select(file)
        else if (!state.selected && files[0]) controller.select(files[0])
        void controller.refresh()
        ctx.sidebarRight.openTab(TAB_KIND)
      }

      function hoverLabel(file) {
        return multi ? file.relPath : file.path
      }

      return h('div', {
        className: 'sc-headerwrap',
        'data-open': String(open),
        onMouseEnter: () => scheduleOpen(true),
        onMouseLeave: () => scheduleOpen(false),
      },
        h('style', null, STYLE),
        h('button', {
          type: 'button',
          className: 'sc-headerbtn',
          'data-has-changes': String(hasChanges),
          title: branch
            ? `${text('panel.open')} · ${branch}`
            : multi
              ? `${text('panel.open')} · ${text('panel.repositories', { n: repos.length })}`
              : text('panel.open'),
          'aria-label': text('panel.open'),
          onClick: (event) => openPanel(null, event),
        },
          hasChanges ? null : h(BranchIcon, { size: 13 }),
          h('span', { className: 'sc-headerbranch' }, label),
          hasChanges
            ? h('span', { className: 'sc-headerstats' },
                h('span', { className: 'up' }, `+${summary.additions}`),
                h('span', { className: 'down' }, `−${summary.deletions}`))
            : null),
        h('div', { className: 'sc-hovercard', role: 'dialog', 'aria-label': text('panel.title') },
          h('div', { className: 'sc-hoverhead' },
            h('strong', null,
              hasChanges
                ? multi
                  ? text('panel.repoCountSummary', {
                      repos: changedRepos.length,
                      files: summary.files,
                    })
                  : text('panel.changedFiles', { n: summary.files })
                : repo?.isRepo || multi
                  ? text('panel.noChangesPill')
                  : text('panel.title')),
            branch ? h('span', null, branch) : null,
            hasChanges
              ? h('span', { className: 'stats' },
                  h('span', { className: 'sc-add' }, `+${summary.additions}`),
                  ' ',
                  h('span', { className: 'sc-del' }, `−${summary.deletions}`))
              : null),
          hasChanges
            ? h(Fragment, null,
                h('div', { className: 'sc-hoverlist' },
                  visibleFiles.map((file, index) => {
                    const fileRepo = repoForFile(data, file)
                    const showRepo = multi && (
                      index === 0 ||
                      visibleFiles[index - 1]?.repoId !== file.repoId
                    )
                    return h(Fragment, { key: fileKey(file) },
                      showRepo
                        ? h('div', { className: 'sc-hoverrepo' },
                            h('span', null, repoDisplayName(fileRepo)),
                            h('span', null,
                              fileRepo?.branch ||
                              (fileRepo?.detached ? text('panel.detached') : fileRepo?.relPath || '')))
                        : null,
                      h('button', {
                        type: 'button',
                        className: 'sc-hoverrow',
                        title: hoverLabel(file),
                        onClick: (event) => openPanel(file, event),
                      },
                        h('span', {
                          className: 'sc-status',
                          'data-status': bnClass(file.status),
                          title: statusLabel(file.status),
                        }, file.status),
                        h('span', { className: 'sc-hovername' }, hoverLabel(file)),
                        h('span', { className: 'sc-hoverstat' },
                          file.binary
                            ? h('span', { style: { color: 'var(--sc-muted)' } }, 'bin')
                            : h(Fragment, null,
                                h('span', { className: 'sc-add' }, `+${file.additions ?? 0}`),
                                ' ',
                                h('span', { className: 'sc-del' }, `−${file.deletions ?? 0}`)))))
                })),
                files.length > visibleFiles.length
                  ? h('div', { className: 'sc-hovermore' }, text('panel.moreFiles', { n: files.length - visibleFiles.length }))
                  : null,
                multi && failedRepos.length > 0
                  ? failedRepos.slice(0, 3).map((failed) => h('div', {
                      className: 'sc-hoverrepoerr',
                      key: `error-${failed.id}`,
                    }, `${repoDisplayName(failed)}: ${failed.error}`))
                  : null)
            : h('div', { className: 'sc-hoverempty' }, text('panel.captureHint'))))
    }

    function filterChangeFiles(files, filter, state = 'all') {
      const query = filter.trim().toLowerCase()
      return files.filter((file) => {
        const stateMatch = state === 'all' || (file.states || []).includes(state)
        if (!stateMatch) return false
        if (!query) return true
        return [
          file.relPath,
          file.path,
          file.oldRelPath,
          file.oldPath,
          file.repoName,
        ].some((value) => String(value || '').toLowerCase().includes(query))
      })
    }

    function buildChangeTree(files) {
      const root = { dirs: new Map(), files: [] }
      for (const file of files) {
        const parts = String(file.path || '').split('/').filter(Boolean)
        if (parts.length === 0) continue
        parts.pop()
        let node = root
        let path = ''
        for (const part of parts) {
          path = path ? `${path}/${part}` : part
          if (!node.dirs.has(part)) {
            node.dirs.set(part, { name: part, path, dirs: new Map(), files: [] })
          }
          node = node.dirs.get(part)
        }
        node.files.push(file)
      }

      function finish(node) {
        const dirs = [...node.dirs.values()]
          .sort((left, right) => left.name.localeCompare(right.name))
          .map(finish)
        const directFiles = node.files
          .sort((left, right) => left.path.localeCompare(right.path))
        const allFiles = directFiles.concat(...dirs.map((dir) => dir.allFiles))
        return {
          name: node.name,
          path: node.path,
          dirs,
          files: directFiles,
          allFiles,
        }
      }

      return finish(root)
    }

    function directoryStatus(node) {
      const statuses = new Set((node?.allFiles || []).map((file) => bnClass(file.status)))
      if (statuses.size === 1) return [...statuses][0]
      if (statuses.has('U')) return 'U'
      if (statuses.has('D')) return 'D'
      if (statuses.has('M') || statuses.has('C') || statuses.has('O')) return 'M'
      if (statuses.has('A')) return 'A'
      return 'M'
    }

    function treeKey(repoId, path) {
      return `${repoId || '.'}\u0000${path}`
    }

    function grouping(data, filter, state = 'all') {
      const filtered = filterChangeFiles(data.files, filter, state)
      const query = filter.trim()
      const byRepo = new Map()
      for (const file of filtered) {
        if (!byRepo.has(file.repoId)) byRepo.set(file.repoId, [])
        byRepo.get(file.repoId).push(file)
      }

      const repositories = Array.isArray(data.repos) && data.repos.length > 0
        ? data.repos
        : [{
            id: '.',
            name: data.repo?.root?.split('/').pop() || '.',
            relPath: '.',
            branch: data.repo?.branch,
            detached: data.repo?.detached,
            error: data.repo?.error || null,
          }]
      const sections = repositories
        .map((repo) => {
          const repoFiles = byRepo.get(repo.id) || []
          const showError = !query && repo.error
          if (repoFiles.length === 0 && !showError) return null
          return {
            repo,
            files: repoFiles,
            tree: buildChangeTree(repoFiles),
          }
        })
        .filter(Boolean)
      return { multi: isMultiRepo(data), filtered, sections }
    }

    function FileList({ data, controller, state }) {
      const [filter, setFilter] = useState('')
      const [stateFilter, setStateFilter] = useState('all')
      const [collapsed, setCollapsed] = useState(() => new Set())
      const view = useMemo(
        () => grouping(data, filter, stateFilter),
        [data, filter, stateFilter],
      )
      const counts = useMemo(() => stateCounts(data.files), [data.files])
      const searchActive = filter.trim().length > 0
      const empty = view.filtered.length === 0 && !view.sections.some(({ repo }) => repo.error)

      function isOpen(key) {
        return searchActive || !collapsed.has(key)
      }

      function toggle(key) {
        setCollapsed((current) => {
          const next = new Set(current)
          if (next.has(key)) next.delete(key)
          else next.add(key)
          return next
        })
      }

      function fileRow(file, repoId, depth) {
        return h('button', {
          type: 'button',
          role: 'treeitem',
          'aria-level': depth + 2,
          key: fileKey(file),
          className: 'sc-tree-row sc-filerow',
          'data-selected': String(state.selected === fileKey(file)),
          style: { paddingLeft: 8 + depth * 14 },
          title: file.oldPath
            ? text('panel.renamed', { path: file.oldRelPath || file.oldPath })
            : (file.relPath || file.path),
          onClick: () => controller.select(file),
        },
          h(FileTypeIcon, { path: file.path }),
          h('span', { className: 'sc-name' }, file.path.slice(file.path.lastIndexOf('/') + 1)),
          h('span', { className: 'sc-statebadges' },
            (file.states || []).map((fileState) => h('span', {
              key: fileState,
              className: 'sc-statebadge',
              'data-state': fileState,
              title: fileStateLabel(fileState),
              'aria-label': fileStateLabel(fileState),
            }, fileStateShort(fileState)))),
          file.binary
            ? h('span', { className: 'sc-count' }, 'bin')
            : h('span', { className: 'sc-count' },
                h('span', { className: 'plus' }, `+${file.additions ?? 0}`),
                ' ',
                h('span', { className: 'minus' }, `−${file.deletions ?? 0}`)),
          h('span', {
            className: 'sc-status',
            'data-status': bnClass(file.status),
            title: statusLabel(file.status),
          }, statusMark(file.status)))
      }

      function treeRows(node, repoId, depth) {
        const rows = []
        for (const dir of node.dirs) {
          const key = treeKey(repoId, dir.path)
          const open = isOpen(key)
          rows.push(h('button', {
            type: 'button',
            role: 'treeitem',
            'aria-level': depth + 2,
            'aria-expanded': open,
            'aria-label': `${dir.name}, ${text('panel.directoryFiles', { n: dir.allFiles.length })}`,
            key: `dir:${key}`,
            className: 'sc-tree-row sc-dirrow',
            style: { paddingLeft: 8 + depth * 14 },
            title: open ? text('panel.collapseDirectory') : text('panel.expandDirectory'),
            onClick: () => toggle(key),
          },
            h(ChevronIcon, { open }),
            h(FolderIcon),
            h('span', { className: 'sc-dirname' }, dir.name),
            h('span', { className: 'sc-dir-dot', 'data-status': directoryStatus(dir) })))
          if (open) rows.push(...treeRows(dir, repoId, depth + 1))
        }
        for (const file of node.files) rows.push(fileRow(file, repoId, depth))
        return rows
      }

      function repoToggleKey(repo) {
        return treeKey(repo.id, '')
      }

      function repoToggle(repo) {
        const key = repoToggleKey(repo)
        const open = isOpen(key)
        toggle(key)
        return open
      }

      function repoToggleLabel(repo) {
        return isOpen(repoToggleKey(repo))
          ? text('panel.collapseDirectory')
          : text('panel.expandDirectory')
      }

      return h('div', { className: 'sc-listpane' },
        h('div', { className: 'sc-tools' },
          h('div', { className: 'sc-searchbox' },
            h(SearchIcon),
            h('input', {
              className: 'sc-search',
              type: 'search',
              value: filter,
              placeholder: text('panel.filter'),
              'aria-label': text('panel.filter'),
              onChange: (event) => setFilter(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Escape' && filter) setFilter('')
              },
            }),
            filter
              ? h('button', {
                  type: 'button',
                  className: 'sc-searchclear',
                  title: text('panel.clearFilter'),
                  'aria-label': text('panel.clearFilter'),
                  onClick: () => setFilter(''),
                }, h(CloseIcon))
              : null),
          h('div', {
            className: 'sc-statefilters',
            role: 'group',
            'aria-label': text('panel.filterState'),
          },
            ['all', 'staged', 'unstaged', 'untracked', 'conflicted'].map((value) => h('button', {
              type: 'button',
              key: value,
              className: 'sc-statefilter',
              'data-active': String(stateFilter === value),
              disabled: value !== 'all' && counts[value] === 0,
              title: value === 'all' ? text('panel.stateAll') : fileStateLabel(value),
              onClick: () => setStateFilter(value),
            }, `${value === 'all' ? text('panel.stateAll') : fileStateLabel(value)} ${counts[value]}`)))),
        h('div', { className: 'sc-listcaption' },
          h('span', null, text('panel.changeTree')),
          h('span', { className: 'sc-listcount' },
            text('panel.files', { n: view.filtered.length }))),
        h('div', {
          className: 'sc-filelist',
          role: 'tree',
          'aria-label': text('panel.changeTree'),
        },
          empty
            ? h(EmptyState, { title: text('panel.filterEmpty') })
            : view.sections.map(({ repo, files, tree }) => {
                const key = repoToggleKey(repo)
                const open = isOpen(key)
                return h('section', {
                  className: 'sc-repo',
                  key: repo.id,
                  role: 'group',
                  'aria-label': repoDisplayName(repo),
                },
                  repo.error
                    ? h(Fragment, null,
                        h('div', {
                          className: 'sc-repohead',
                          'data-error': 'true',
                          role: 'treeitem',
                          'aria-level': 1,
                        },
                          h(FolderIcon),
                          h('span', { className: 'sc-reponame', title: repo.relPath }, repoDisplayName(repo)),
                          h('span', { className: 'sc-repostat' }, '⚠')),
                        h('div', { className: 'sc-repoerror' },
                          `${text('panel.repoError')}: ${repo.error}`))
                    : h('button', {
                        type: 'button',
                        className: 'sc-repohead',
                        role: 'treeitem',
                        'aria-level': 1,
                        'aria-expanded': open,
                        title: repoToggleLabel(repo),
                        onClick: () => repoToggle(repo),
                      },
                        h(ChevronIcon, { open }),
                        h(FolderIcon),
                        h('span', { className: 'sc-reponame', title: repo.relPath }, repoDisplayName(repo)),
                        repo.branch
                          ? h('span', { className: 'sc-repobranch', title: repo.branch }, repo.branch)
                          : repo.detached
                            ? h('span', { className: 'sc-repobranch' }, text('panel.detached'))
                            : null,
                        h('span', { className: 'sc-repostat' },
                          text('panel.files', { n: files.length }))),
                  repo.error || !open ? null : treeRows(tree, repo.id, 0))
              })))
    }

    function RevisionPicker({ controller, state }) {
      const [open, setOpen] = useState(false)
      const root = useRef(null)
      const history = state.historyData
      const repos = history?.repos || []
      const selected = state.selectedCommit
      const sessionBranches = (repo) => (repo.branches || [])
        .filter((branch) => isSessionBranch(state.historyBaselines, { ...branch, repoId: repo.id }))

      useEffect(() => {
        if (!open) return undefined
        const close = (event) => {
          if (root.current && !root.current.contains(event.target)) setOpen(false)
        }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
      }, [open])

      useEffect(() => {
        if (open && !state.historyLoaded && !state.historyLoading) {
          void controller.loadHistory()
        }
      }, [controller, open, state.historyLoaded, state.historyLoading])

      useEffect(() => {
        if (!open || !history) return
        for (const repo of history.repos || []) {
          for (const branch of repo.branches || []) {
            const key = branchHistoryKey(repo.id, branch.name)
            const branchState = state.branchCommits[key]
            if (!branchState?.data && !branchState?.loading && !branchState?.error) {
              void controller.loadCommits(repo.id, branch.name)
            }
          }
        }
      }, [controller, history, open, state.branchCommits])

      const currentRepo = state.data?.repo
      const currentRepos = state.data?.repos || []
      const currentBranch = isMultiRepo(state.data)
        ? text('panel.repositories', { n: currentRepos.length })
        : currentRepo?.branch || (currentRepo?.detached ? text('panel.detached') : null)
      const currentSummary = state.data?.summary?.files
        ? text('panel.changedFiles', { n: state.data.summary.files })
        : text('panel.captureHint')
      const label = selected
        ? [
            isMultiRepo(state.data) ? selected.repoName : null,
            selected.branch,
            selected.shortSha,
          ].filter(Boolean).join(' · ')
        : text('panel.currentChanges')

      function chooseCurrent() {
        controller.showCurrent()
        setOpen(false)
      }

      function chooseCommit(repo, branch, commit) {
        void controller.selectCommit(repo.id, branch.name, commit)
        setOpen(false)
      }

      function commitItem(repo, branch, commit) {
        const isSelected = (
          selected?.repoId === repo.id &&
          selected?.branch === branch.name &&
          selected?.sha === commit.sha
        )
        return h('button', {
          type: 'button',
          role: 'option',
          key: commit.sha,
          className: 'sc-pickeritem',
          'data-selected': String(isSelected),
          'aria-selected': String(isSelected),
          title: `${branch.name} · ${commit.sha}\n${commit.subject}`,
          onClick: () => chooseCommit(repo, branch, commit),
        },
          h('span', { className: 'sc-pickeritemcopy' },
            h('span', { className: 'sc-pickerrevision' },
              h('span', { className: 'sc-pickerbranch' }, branch.name),
              h('span', null, '·'),
              h('span', { className: 'sc-pickersha' }, shortSha(commit.sha))),
            h('span', { className: 'sc-pickeritemsubject' },
              commit.subject || shortSha(commit.sha))),
          h('span', { className: 'sc-pickertime' },
            formatCommitTime(commit.timestamp)))
      }

      function branchGroup(repo, branch) {
        const key = branchHistoryKey(repo.id, branch.name)
        const branchState = state.branchCommits[key]
        const commits = branchState?.data?.commits || []
        return h(Fragment, { key },
          h('div', { className: 'sc-pickerbranchhead' },
            h(BranchIcon, { size: 12 }),
            h('span', { className: 'sc-branchname' }, branch.name),
            branch.current
              ? h('span', { className: 'sc-currenttag' }, text('panel.currentBranch'))
              : null),
          branchState?.loading && !branchState.data
            ? h('div', { className: 'sc-pickerloading' }, text('panel.pickerLoading'))
            : null,
          branchState?.error
            ? h('div', { className: 'sc-pickerloading' },
                branchState.error,
                h('button', {
                  type: 'button',
                  className: 'sc-statefilter',
                  onClick: () => void controller.loadCommits(repo.id, branch.name),
                }, text('panel.retry')))
            : null,
          branchState?.data && commits.length === 0
            ? h('div', { className: 'sc-pickerloading' }, text('panel.pickerNoCommits'))
            : null,
          commits.map((commit) => commitItem(repo, branch, commit)))
      }

      function repoGroup(repo) {
        return h(Fragment, { key: repo.id },
          h('div', {
            className: 'sc-pickerrepo',
            title: repo.relPath,
          }, repoDisplayName(repo)),
          repo.error
            ? h('div', { className: 'sc-pickerloading', 'data-error': 'true' }, repo.error)
            : sessionBranches(repo).map((branch) => branchGroup(repo, branch)))
      }

      return h('div', {
        className: 'sc-picker',
        ref: root,
        onKeyDown: (event) => {
          if (event.key === 'Escape') setOpen(false)
        },
      },
        h('button', {
          type: 'button',
          className: 'sc-pickerbtn',
          'data-history': String(Boolean(selected)),
          title: selected ? selected.subject : text('panel.selectRevision'),
          'aria-haspopup': 'listbox',
          'aria-expanded': String(open),
          onClick: () => setOpen((value) => !value),
        },
          h('span', { className: 'sc-pickerlabel' }, label),
          h(ChevronIcon, { open: true, className: 'sc-pickerchevron' })),
        open
          ? h('div', {
              className: 'sc-pickerpop',
              role: 'listbox',
              'aria-label': text('panel.selectRevision'),
            },
              h('button', {
                type: 'button',
                role: 'option',
                className: 'sc-pickercurrent',
                'data-selected': String(!selected),
                'aria-selected': String(!selected),
                onClick: chooseCurrent,
              },
                h('span', { className: 'sc-pickercurrenticon' }, h(BranchIcon, { size: 16 })),
                h('span', { className: 'sc-pickercurrentcopy' },
                  h('span', { className: 'sc-pickercurrenttitle' }, text('panel.currentChanges')),
                  h('span', { className: 'sc-pickercurrenthint' },
                    [currentBranch, currentSummary].filter(Boolean).join(' · ')))),
              state.historyLoading && !history
                ? h('div', { className: 'sc-pickerloading' }, text('panel.pickerLoading'))
                : null,
              state.historyError && !history
                ? h('div', { className: 'sc-pickerloading' },
                    text('panel.historyError'),
                    h('button', {
                      type: 'button',
                      className: 'sc-statefilter',
                      onClick: () => void controller.loadHistory(),
                    }, text('panel.retry')))
                : null,
              repos.map(repoGroup))
          : null)
    }

    function HistoryList({ controller, state }) {
      const data = state.historyData
      const [collapsedRepos, setCollapsedRepos] = useState(() => new Set())
      const [openBranches, setOpenBranches] = useState(() => new Set())
      useEffect(() => {
        if (!data) return
        for (const repo of data.repos || []) {
          for (const branch of repo.branches || []) {
            const key = branchHistoryKey(repo.id, branch.name)
            const branchState = state.branchCommits[key]
            if (
              openBranches.has(key) &&
              !branchState?.data &&
              !branchState?.loading &&
              !branchState?.error
            ) {
              void controller.loadCommits(repo.id, branch.name)
            }
          }
        }
      }, [controller, data, openBranches, state.branchCommits])

      if (state.historyLoading && !data) {
        return h('div', { className: 'sc-listpane' },
          h(EmptyState, { title: text('panel.loadingHistory') }, h('div', { className: 'sc-spinner' })))
      }
      if (state.historyError && !data) {
        return h('div', { className: 'sc-listpane' },
          h(EmptyState, {
            title: text('panel.historyError'),
            hint: state.historyError,
            retry: () => void controller.loadHistory(),
          }))
      }
      if (!data) {
        return h('div', { className: 'sc-listpane' },
          h(EmptyState, { title: text('panel.loadingHistory') }))
      }
      const repos = data.repos || []
      if (repos.length === 0) {
        return h('div', { className: 'sc-listpane' },
          h(EmptyState, {
            title: text('panel.notRepo'),
            hint: text('panel.notRepoHint'),
          }))
      }
      const sessionBranches = (repo) => (repo.branches || [])
        .filter((branch) => isSessionBranch(state.historyBaselines, { ...branch, repoId: repo.id }))
      const branchCount = repos.reduce(
        (count, repo) => count + sessionBranches(repo).length,
        0,
      )

      function toggleRepo(repoId) {
        setCollapsedRepos((current) => {
          const next = new Set(current)
          if (next.has(repoId)) next.delete(repoId)
          else next.add(repoId)
          return next
        })
      }

      function toggleBranch(repoId, branch) {
        const key = branchHistoryKey(repoId, branch)
        setOpenBranches((current) => {
          const next = new Set(current)
          if (next.has(key)) next.delete(key)
          else next.add(key)
          return next
        })
      }

      function branchRows(repo) {
        const branches = sessionBranches(repo)
        if ((repo.branches || []).length === 0) {
          return h('div', { className: 'sc-historynote' },
            text('panel.noLocalBranches'), ' · ', text('panel.noLocalBranchesHint'))
        }
        if (branches.length === 0) {
          return h('div', { className: 'sc-historynote' }, text('panel.noSessionBranches'))
        }
        return branches.map((branch) => {
          const key = branchHistoryKey(repo.id, branch.name)
          const open = openBranches.has(key)
          const branchState = state.branchCommits[key]
          const commits = branchState?.data?.commits || []
          return h(Fragment, { key },
            h('button', {
              type: 'button',
              className: 'sc-branchrow',
              'aria-expanded': open,
              onClick: () => toggleBranch(repo.id, branch.name),
            },
              h(ChevronIcon, { open }),
              h(BranchIcon, { size: 14 }),
              h('span', { className: 'sc-branchname', title: branch.name }, branch.name),
              branch.current ? h('span', { className: 'sc-currenttag' }, text('panel.currentBranch')) : null,
              h('span', { className: 'sc-branchmeta' },
                branchState?.data
                  ? text('panel.branchCommits', { n: branchState.data.total })
                  : shortSha(branch.sha))),
            open && branchState?.loading && !branchState.data
              ? h('div', { className: 'sc-historynote' }, text('panel.loadingCommits'))
              : null,
            open && branchState?.error
              ? h('div', { className: 'sc-historynote', 'data-error': 'true' },
                  branchState.error,
                  h('button', {
                    type: 'button',
                    className: 'sc-statefilter',
                    onClick: () => void controller.loadCommits(repo.id, branch.name),
                  }, text('panel.retry')))
              : null,
            open && commits.length > 0
              ? commits.map((commit) => h('button', {
                  type: 'button',
                  key: commit.sha,
                  className: 'sc-commitrow',
                  'data-selected': String(
                    state.selectedCommit?.repoId === repo.id &&
                    state.selectedCommit?.branch === branch.name &&
                    state.selectedCommit?.sha === commit.sha
                  ),
                  title: commit.subject,
                  onClick: () => void controller.selectCommit(repo.id, branch.name, commit),
                },
                  h('span', { className: 'sc-commitsha' }, shortSha(commit.sha)),
                  h('span', { className: 'sc-commitsubject' }, commit.subject || shortSha(commit.sha)),
                  h('span', { className: 'sc-committime' }, formatCommitTime(commit.timestamp))))
              : null,
            open && branchState?.data && commits.length === 0
              ? h('div', { className: 'sc-historynote' }, text('panel.noSessionCommits'))
              : null,
            open && branchState?.data?.truncated
              ? h('div', { className: 'sc-historynote' },
                  text('panel.commitsTruncated', { n: branchState.data.commits.length }))
              : null)
        })
      }

      return h('div', { className: 'sc-listpane' },
        h('div', { className: 'sc-tools' },
          h('div', { className: 'sc-listcaption', style: { padding: '0 1px', minHeight: 31 } },
            h('span', null, text('panel.localBranches')),
            h('span', { className: 'sc-listcount' }, branchCount))),
        h('div', { className: 'sc-filelist', role: 'tree', 'aria-label': text('panel.localBranches') },
          repos.map((repo) => {
            const open = !collapsedRepos.has(repo.id)
            return h('section', {
              className: 'sc-history-repo',
              key: repo.id,
              role: 'group',
              'aria-label': repoDisplayName(repo),
            },
              repo.error
                ? h(Fragment, null,
                    h('div', { className: 'sc-repohead', 'data-error': 'true', role: 'treeitem' },
                      h(FolderIcon),
                      h('span', { className: 'sc-reponame' }, repoDisplayName(repo)),
                      h('span', { className: 'sc-repostat' }, '⚠')),
                    h('div', { className: 'sc-repoerror' },
                      `${text('panel.repoError')}: ${repo.error}`))
                : h(Fragment, null,
                    h('button', {
                      type: 'button',
                      className: 'sc-repohead',
                      'aria-expanded': open,
                      onClick: () => toggleRepo(repo.id),
                    },
                      h(ChevronIcon, { open }),
                      h(FolderIcon),
                      h('span', { className: 'sc-reponame', title: repo.relPath }, repoDisplayName(repo)),
                      repo.branch
                        ? h('span', { className: 'sc-repobranch', title: repo.branch }, repo.branch)
                        : repo.detached
                          ? h('span', { className: 'sc-repobranch' }, text('panel.detached'))
                          : null,
                      h('span', { className: 'sc-repostat' },
                        text('panel.localBranchCount', { n: repo.branches?.length || 0 }))),
                    open ? branchRows(repo) : null,
                    open && repo.truncated
                      ? h('div', { className: 'sc-historynote' },
                          text('panel.branchesTruncated', { n: repo.branches.length }))
                      : null))
          })))
    }

    function CommitFileList({ controller, state }) {
      const data = state.commitData
      const selectedCommit = state.selectedCommit
      const [collapsed, setCollapsed] = useState(() => new Set())
      if (!selectedCommit) {
        return h('div', { className: 'sc-listpane' },
          h(EmptyState, { title: text('panel.loadingCommits') }, h('div', { className: 'sc-spinner' })))
      }
      if (state.commitError) {
        return h('div', { className: 'sc-listpane' },
          h(EmptyState, {
            title: text('panel.commitLoadError'),
            hint: state.commitError,
            retry: () => void controller.selectCommit(
              selectedCommit.repoId,
              selectedCommit.branch,
              { sha: selectedCommit.sha, subject: selectedCommit.subject, timestamp: selectedCommit.timestamp },
            ),
          }, h('button', {
            type: 'button',
            className: 'sc-retry',
            onClick: () => controller.showCurrent(),
          }, text('panel.backToCurrent'))))
      }
      if (!data) {
        return h('div', { className: 'sc-listpane' },
          h(EmptyState, { title: text('panel.loadingCommits') }, h('div', { className: 'sc-spinner' })))
      }
      const tree = buildChangeTree(data.files)

      function isOpen(path) {
        return !collapsed.has(path)
      }

      function toggle(path) {
        setCollapsed((current) => {
          const next = new Set(current)
          if (next.has(path)) next.delete(path)
          else next.add(path)
          return next
        })
      }

      function fileRow(file, depth) {
        return h('button', {
          type: 'button',
          role: 'treeitem',
          'aria-level': depth + 1,
          key: file.path,
          className: 'sc-tree-row sc-filerow',
          'data-selected': String(state.commitFile === file.path),
          style: { paddingLeft: 8 + depth * 14 },
          title: file.oldPath ? text('panel.renamed', { path: file.oldPath }) : file.path,
          onClick: () => void controller.selectCommitFile(file),
        },
          h(FileTypeIcon, { path: file.path }),
          h('span', { className: 'sc-name' }, file.path.slice(file.path.lastIndexOf('/') + 1)),
          file.binary
            ? h('span', { className: 'sc-count' }, 'bin')
            : h('span', { className: 'sc-count' },
                h('span', { className: 'plus' }, `+${file.additions ?? 0}`),
                ' ',
                h('span', { className: 'minus' }, `−${file.deletions ?? 0}`)),
          h('span', {
            className: 'sc-status',
            'data-status': bnClass(file.status),
            title: statusLabel(file.status),
          }, statusMark(file.status)))
      }

      function treeRows(node, depth) {
        const rows = []
        for (const dir of node.dirs) {
          const open = isOpen(dir.path)
          rows.push(h('button', {
            type: 'button',
            role: 'treeitem',
            'aria-level': depth + 1,
            'aria-expanded': open,
            key: `dir:${dir.path}`,
            className: 'sc-tree-row sc-dirrow',
            style: { paddingLeft: 8 + depth * 14 },
            title: open ? text('panel.collapseDirectory') : text('panel.expandDirectory'),
            onClick: () => toggle(dir.path),
          },
            h(ChevronIcon, { open }),
            h(FolderIcon),
            h('span', { className: 'sc-dirname' }, dir.name),
            h('span', { className: 'sc-dir-dot', 'data-status': directoryStatus(dir) })))
          if (open) rows.push(...treeRows(dir, depth + 1))
        }
        for (const file of node.files) rows.push(fileRow(file, depth))
        return rows
      }

      return h('div', { className: 'sc-listpane' },
        h('div', { className: 'sc-commit-toolbar' },
          h('button', {
            type: 'button',
            className: 'sc-back',
            'data-always': 'true',
            onClick: () => controller.showCurrent(),
          }, h(BackIcon), text('panel.backToCurrent')),
          h('span', { className: 'sc-commit-toolbar-title' },
            `${selectedCommit.shortSha} · ${selectedCommit.branch}`)),
        h('div', { className: 'sc-listcaption' },
          h('span', null, text('panel.changeTree')),
          h('span', { className: 'sc-listcount' },
            text('panel.files', { n: data.files.length }))),
        h('div', { className: 'sc-filelist', role: 'tree', 'aria-label': text('panel.selectCommitFile') },
          data.files.length === 0
            ? h(EmptyState, { title: text('panel.commitNoFiles') })
            : treeRows(tree, 0)))
    }

    function DiffContent({ file, diff, loading, error, resetKey, retry }) {
      const scroll = useRef(null)
      useEffect(() => {
        if (scroll.current) scroll.current.scrollTop = 0
      }, [resetKey])

      if (loading) {
        return h(EmptyState, { title: text('panel.loading') }, h('div', { className: 'sc-spinner' }))
      }
      if (error) {
        return h(EmptyState, {
          title: text('panel.readError'),
          hint: error,
          retry,
        })
      }
      if (file?.binary || diff?.binary) {
        return h(EmptyState, {
          title: text('panel.binary'),
          hint: text('panel.binaryHint'),
        })
      }
      return h('div', { className: 'sc-diffscroll', ref: scroll },
        diff?.truncated
          ? h('div', { className: 'sc-notice' }, text('panel.truncated', { n: diff.originalLength.toLocaleString() }))
          : null,
        file?.oldPath
          ? h('div', { className: 'sc-meta' }, text('panel.renamed', { path: file.oldPath }))
          : null,
        diff?.hunks?.length
          ? h('div', { className: 'sc-diff' },
              diff.hunks.map((hunk, hunkIndex) => h(Fragment, { key: `${hunk.header}-${hunkIndex}` },
                h('div', { className: 'sc-hunk' }, hunk.header),
                h('div', { className: 'sc-lines' },
                  hunk.lines.map((line, lineIndex) => line.kind === 'meta'
                    ? h('div', { key: lineIndex, className: 'sc-meta' }, line.text)
                    : h('div', {
                        key: lineIndex,
                        className: `sc-line ${line.kind}`,
                      },
                        h('span', { className: 'sc-ln' }, line.old ?? ''),
                        h('span', { className: 'sc-ln' }, line.new ?? ''),
                        h('span', { className: 'sc-sign' },
                          line.kind === 'add' ? '+' : line.kind === 'del' ? '−' : ' '),
                        h('span', { className: 'sc-code' }, line.text || ' ')))))))
          : h(EmptyState, {
              title: text('panel.noTextDiff'),
              hint: text('panel.noTextHint'),
            }))
    }

    function CommitDetail({ controller, state }) {
      const selected = state.selectedCommit
      if (!selected) {
        return h('div', { className: 'sc-detailpane' },
          h(EmptyState, {
            title: text('panel.selectCommit'),
            hint: text('panel.selectCommitHint'),
          }))
      }
      if (state.commitLoading) {
        return h('div', { className: 'sc-detailpane' },
          h(EmptyState, { title: text('panel.loadingCommits') }, h('div', { className: 'sc-spinner' })))
      }
      if (state.commitError) {
        return h('div', { className: 'sc-detailpane' },
          h(EmptyState, {
            title: text('panel.commitLoadError'),
            hint: state.commitError,
            retry: () => void controller.selectCommit(
              selected.repoId,
              selected.branch,
              { sha: selected.sha, subject: selected.subject, timestamp: selected.timestamp },
            ),
          }))
      }
      const data = state.commitData
      if (!data) {
        return h('div', { className: 'sc-detailpane' },
          h(EmptyState, { title: text('panel.loadingCommits') }))
      }
      const file = data.files.find((item) => item.path === state.commitFile) || null
      if (file) {
        return h('div', { className: 'sc-detailpane' },
          h('div', { className: 'sc-detailhead' },
            h('button', {
              type: 'button',
              className: 'sc-back',
              'data-always': 'true',
              onClick: () => controller.clearCommitFile(),
            }, h(BackIcon), text('panel.backToCommit')),
            h('span', { className: 'sc-detailtitle', title: file.path }, file.path),
            file.binary
              ? h('span', { className: 'sc-detailstat', style: { color: 'var(--sc-muted)' } },
                  text('panel.binary'))
              : h('span', { className: 'sc-detailstat' },
                  h('span', { className: 'sc-add' }, `+${file.additions ?? 0}`),
                  ' ',
                  h('span', { className: 'sc-del' }, `−${file.deletions ?? 0}`))),
          h(DiffContent, {
            file,
            diff: state.commitDiff,
            loading: state.commitDiffLoading,
            error: state.commitDiffError,
            resetKey: file.path,
            retry: () => void controller.selectCommitFile(file),
          }))
      }

      const commit = data.commit
      const kind = commit.parents.length === 0
        ? text('panel.commitRoot')
        : commit.isMerge
          ? text('panel.commitMerge')
          : text('panel.commitParent', { sha: shortSha(commit.parents[0]) })
      return h('div', { className: 'sc-detailpane' },
        h('div', { className: 'sc-detailhead' },
          h('button', {
            type: 'button',
            className: 'sc-back',
            'data-always': 'true',
            onClick: () => controller.showCurrent(),
          }, h(BackIcon), text('panel.backToCurrent')),
          h('span', { className: 'sc-detailtitle' }, shortSha(commit.sha))),
        h('div', { className: 'sc-commitmeta' },
          h('div', { className: 'sc-commitmeta-card' },
            h('div', { className: 'sc-commitmeta-kicker' }, kind),
            h('div', { className: 'sc-commitmeta-subject' }, commit.subject),
            h('div', {
              className: 'sc-commitmeta-sha',
              title: commit.sha,
            }, shortSha(commit.sha)),
            h('div', { className: 'sc-commitmeta-grid' },
              h('strong', null, text('panel.branch')),
              h('span', null, selected.branch),
              h('strong', null, text('panel.files', { n: data.files.length })),
              h('span', null, `+${data.summary.additions} −${data.summary.deletions}`),
              h('strong', null, text('panel.author')),
              h('span', null, commit.author),
              h('strong', null, text('panel.changed')),
              h('span', null, formatCommitTime(commit.timestamp)))),
          h('div', { className: 'sc-empty-inline' },
            text('panel.selectCommitFileHint'))))
    }

    function DiffView({ state, controller }) {
      const selected = state.data?.files.find((file) => fileKey(file) === state.selected) || null

      if (!selected) {
        return h('div', { className: 'sc-detailpane' },
          h(EmptyState, {
            title: text('panel.selectFile'),
            hint: text('panel.selectHint'),
          }))
      }

      const selectedRepo = repoForFile(state.data, selected)
      const detailTitle = isMultiRepo(state.data) && selectedRepo
        ? `${repoDisplayName(selectedRepo)} › ${selectedRepo.branch || (selectedRepo.detached ? text('panel.detached') : selectedRepo.relPath)} › ${selected.path}`
        : selected.path
      return h('div', { className: 'sc-detailpane' },
        h('div', { className: 'sc-detailhead' },
          h('button', {
            type: 'button',
            className: 'sc-back',
            onClick: () => controller.clearSelection(),
          }, h(BackIcon), text('panel.back')),
          h('span', { className: 'sc-detailtitle', title: detailTitle }, detailTitle),
          selected.binary
            ? h('span', { className: 'sc-detailstat', style: { color: 'var(--sc-muted)' } }, text('panel.binary'))
            : h('span', { className: 'sc-detailstat' },
              h('span', { className: 'sc-add' }, `+${selected.additions ?? 0}`),
              ' ',
              h('span', { className: 'sc-del' }, `−${selected.deletions ?? 0}`))),
        h(DiffContent, {
          file: selected,
          diff: state.diff,
          loading: state.diffLoading,
          error: state.diffError,
          resetKey: state.selected,
          retry: () => controller.select(selected),
        }))
    }

    function SessionChangesPanel({ ctx, sessionId }) {
      const { controller, state, cwd } = useSessionController(ctx, sessionId)
      const mode = state.mode
      const data = state.data
      const repo = data?.repo
      const repos = data?.repos || []
      const workspace = data?.workspace
      const history = state.historyData
      const historyRepos = history?.repos || []
      const historyBranches = historyRepos.reduce(
        (count, item) => count + (item.branches?.length || 0),
        0,
      )
      const multi = isMultiRepo(data)
      const summary = data?.summary
      const hasRepoErrors = repos.some((item) => item.error)
      const isDetail = mode === 'history'
        ? Boolean(state.commitFile)
        : Boolean(state.selected)
      let body

      if (!sessionId) {
        body = h(EmptyState, { title: text('panel.noSession') })
      } else if (!cwd) {
        body = h(EmptyState, {
          title: text('panel.noCwd'),
          hint: text('panel.noCwdHint'),
        })
      } else if (mode === 'history' && state.selectedCommit) {
        body = h('div', { className: 'sc-workspace', 'data-detail': String(isDetail) },
          h(CommitDetail, { controller, state }),
          h(CommitFileList, { controller, state }))
      } else if (state.error && !data) {
        body = h(EmptyState, {
          title: text('panel.readError'),
          hint: state.error,
          retry: () => void controller.refresh(),
        })
      } else if (state.loading && !data) {
        body = h(EmptyState, {
          title: text('panel.loading'),
        }, h('div', { className: 'sc-spinner' }))
      } else if (workspace?.status === 'no-repos' || (!workspace && repo && repo.isRepo === false)) {
        body = h(EmptyState, {
          title: text('panel.notRepo'),
          hint: text('panel.notRepoHint'),
        })
      } else if (data && data.files.length === 0 && !hasRepoErrors) {
        body = h(EmptyState, {
          title: text('panel.noChanges'),
          hint: data.captured ? text('panel.captureHint') : text('panel.selectHint'),
        })
      } else if (data) {
        body = h('div', { className: 'sc-workspace', 'data-detail': String(isDetail) },
          h(DiffView, { state, controller }),
          h(FileList, { data, controller, state }))
      } else {
        body = h(EmptyState, { title: text('panel.loading') })
      }

      const summaryLabel = mode === 'history'
        ? text('panel.historySummary', {
            repos: historyRepos.length,
            branches: historyBranches,
          })
        : multi
          ? text('panel.repoSummary', { repos: repos.length, files: summary?.files || 0 })
          : changeCountLabel(summary)
      const busy = mode === 'history'
        ? state.historyLoading
        : state.refreshing || state.loading
      return h('div', { className: 'sc-root' },
        h('header', { className: 'sc-header' },
          h('div', { className: 'sc-headline' },
            h(BranchIcon, { size: 16 }),
            h('span', { className: 'sc-title' }, text('panel.title')),
            h(RevisionPicker, { controller, state }),
            h('span', { className: 'sc-spacer' }),
            h('button', {
              type: 'button',
              className: 'sc-headbtn',
              title: text('panel.refresh'),
              disabled: busy,
              onClick: () => void controller.refresh(),
            }, h(RefreshIcon), busy ? text('panel.refreshing') : text('panel.refresh'))),
          mode === 'history' || data
            ? h('div', { className: 'sc-subline' },
                h('span', null, summaryLabel),
                mode === 'current' ? h(Stat, { summary }) : null,
                h('span', { className: 'sc-spacer' }),
                mode === 'current' && data?.baseline?.capturedAt
                  ? h('span', { title: text('panel.baseline') }, text('panel.capturedAt', { hash: data.baseline.tree.slice(0, 7) }))
                  : null)
            : null,
          mode === 'current' && data?.workspace?.partial
            ? h('div', { className: 'sc-notice' }, text('panel.partial'))
            : null,
          mode === 'current' && data?.workspace?.truncated
            ? h('div', { className: 'sc-notice' },
                text('panel.truncatedRepos', { n: data.workspace.repositoryCount }))
            : null,
          mode === 'current' && state.error && data
            ? h('div', { className: 'sc-notice' }, state.error)
            : mode === 'history' && state.historyError && history
              ? h('div', { className: 'sc-notice' }, state.historyError)
            : null),
        body)
    }

    function GuideIcon({ size = 16 }) {
      return h(BranchIcon, { size })
    }

    const plugin = {
      inject: ['slots', 'locale', 'sessions', 'sidebarRight', 'sidebarRightTabs'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh: ZH, en: EN }), 'session-changes: locale')
        tr = ctx.locale.bind(NS)

        ctx.effect(() => ctx.sidebarRightTabs.register({
          id: TAB_ID,
          kind: TAB_KIND,
          priority: 'extension',
          title: () => text('panel.title'),
          guide: [{
            order: 18,
            title: () => text('panel.title'),
            description: () => text('panel.guide'),
            icon: GuideIcon,
          }],
        }), 'session-changes: right sidebar tab type')

        function TabBody(props) {
          return h(SessionChangesPanel, { ctx, sessionId: props.sessionId })
        }

        ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
          name: 'sidebar.right.pane.tab',
          key: TAB_ID,
          locale: NS,
        }, TabBody)), 'session-changes: right sidebar tab body')

        function Header(props) {
          return h(HeaderButton, { ctx, sessionId: props.sessionId })
        }

        ctx.effect(() => ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
          name: 'conversation.session.header.utilities',
          id: TAB_ID,
          order: 9,
          label: () => text('panel.open'),
        }, Header)), 'session-changes: session header entry')
      },
    }
    if (globalThis.__DSH_WORKING_CHANGES_TEST__) {
      plugin.__test = {
        branchHistoryKey,
        buildChangeTree,
        captureHistoryBaselines,
        CommitDetail,
        CommitFileList,
        commitKey,
        DiffContent,
        directoryStatus,
        FileList,
        filterChangeFiles,
        formatCommitTime,
        grouping,
        HistoryList,
        isSessionBranch,
        RevisionPicker,
        stateCounts,
      }
    }
    return plugin
  },
})
