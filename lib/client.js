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
      'panel.guide': '查看当前工作区相对 HEAD 改了哪些文件，并逐个查看 diff。',
      'panel.branch': '当前分支',
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
      'panel.guide': 'See every file changed from HEAD in this workspace and inspect each diff.',
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
      .sc-detailtitle {
        flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        font: 600 11.5px/1.45 var(--sc-mono);
      }
      .sc-detailpath { color: var(--sc-muted); font-weight: 500; }
      .sc-detailstat { flex: none; font: 600 10px/1 var(--sc-mono); font-variant-numeric: tabular-nums; }
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

    function ChevronIcon({ open }) {
      return h('svg', {
        className: 'sc-chevron',
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
        loading: false,
        refreshing: false,
        data: null,
        error: null,
        selected: null,
        diff: null,
        diffLoading: false,
        diffError: null,
      })
      let watchers = 0
      let offSession = null
      let offFocus = null
      let refreshTimer = null
      let loadSequence = 0
      let diffSequence = 0

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
      }

      function setCwd(cwd) {
        if (store.get().cwd === cwd) {
          if (cwd && !store.get().data && !store.get().loading) void refresh()
          return
        }
        loadSequence += 1
        diffSequence += 1
        set({
          cwd: cwd || null,
          loading: false,
          refreshing: false,
          data: null,
          error: null,
          selected: null,
          diff: null,
          diffLoading: false,
          diffError: null,
        })
        if (cwd) void refresh()
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

    function filterChangeFiles(files, filter) {
      const query = filter.trim().toLowerCase()
      if (!query) return files.slice()
      return files.filter((file) => [
        file.relPath,
        file.path,
        file.oldRelPath,
        file.oldPath,
        file.repoName,
      ].some((value) => String(value || '').toLowerCase().includes(query)))
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

    function grouping(data, filter) {
      const filtered = filterChangeFiles(data.files, filter)
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
      const [collapsed, setCollapsed] = useState(() => new Set())
      const view = useMemo(
        () => grouping(data, filter),
        [data, filter],
      )
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
              : null)),
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

    function DiffView({ state, controller }) {
      const scroll = useRef(null)
      const selected = state.data?.files.find((file) => fileKey(file) === state.selected) || null
      useEffect(() => {
        if (scroll.current) scroll.current.scrollTop = 0
      }, [state.selected])

      if (!selected) {
        return h('div', { className: 'sc-detailpane' },
          h(EmptyState, {
            title: text('panel.selectFile'),
            hint: text('panel.selectHint'),
          }))
      }

      const diff = state.diff
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
        state.diffLoading
          ? h(EmptyState, { title: text('panel.loading') }, h('div', { className: 'sc-spinner' }))
          : state.diffError
            ? h(EmptyState, {
                title: text('panel.readError'),
                hint: state.diffError,
                retry: () => controller.select(selected),
              })
            : selected.binary || diff?.binary
              ? h(EmptyState, {
                  title: text('panel.binary'),
                  hint: text('panel.binaryHint'),
                })
              : h('div', { className: 'sc-diffscroll', ref: scroll },
                  diff?.truncated
                    ? h('div', { className: 'sc-notice' }, text('panel.truncated', { n: diff.originalLength.toLocaleString() }))
                    : null,
                  selected.oldPath
                    ? h('div', { className: 'sc-meta' }, text('panel.renamed', { path: selected.oldPath }))
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
                                  h('span', { className: 'sc-sign' }, line.kind === 'add' ? '+' : line.kind === 'del' ? '−' : ' '),
                                  h('span', { className: 'sc-code' }, line.text || ' ')))))))
                    : h(EmptyState, {
                        title: text('panel.noTextDiff'),
                        hint: text('panel.noTextHint'),
                      })))
    }

    function SessionChangesPanel({ ctx, sessionId }) {
      const { controller, state, cwd } = useSessionController(ctx, sessionId)
      const data = state.data
      const repo = data?.repo
      const repos = data?.repos || []
      const workspace = data?.workspace
      const multi = isMultiRepo(data)
      const summary = data?.summary
      const hasRepoErrors = repos.some((item) => item.error)
      const isDetail = Boolean(state.selected)
      let body

      if (!sessionId) {
        body = h(EmptyState, { title: text('panel.noSession') })
      } else if (!cwd) {
        body = h(EmptyState, {
          title: text('panel.noCwd'),
          hint: text('panel.noCwdHint'),
        })
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

      const branch = !multi ? repo?.branch : null
      const summaryLabel = multi
        ? text('panel.repoSummary', { repos: repos.length, files: summary?.files || 0 })
        : changeCountLabel(summary)
      return h('div', { className: 'sc-root' },
        h('header', { className: 'sc-header' },
          h('div', { className: 'sc-headline' },
            h(BranchIcon, { size: 16 }),
            h('span', { className: 'sc-title' }, text('panel.title')),
            branch
              ? h('span', { className: 'sc-branch', title: branch }, branch)
              : !multi && repo?.detached
                ? h('span', { className: 'sc-branch' }, text('panel.detached'))
                : multi
                  ? h('span', { className: 'sc-branch' },
                      text('panel.repositories', { n: repos.length }))
                  : null,
            h('span', { className: 'sc-spacer' }),
            h('button', {
              type: 'button',
              className: 'sc-headbtn',
              title: text('panel.refresh'),
              disabled: state.refreshing || state.loading,
              onClick: () => void controller.refresh(),
            }, h(RefreshIcon), state.refreshing ? text('panel.refreshing') : text('panel.refresh'))),
          data
            ? h('div', { className: 'sc-subline' },
                h('span', null, summaryLabel),
                h(Stat, { summary }),
                h('span', { className: 'sc-spacer' }),
                data.baseline?.capturedAt
                  ? h('span', { title: text('panel.baseline') }, text('panel.capturedAt', { hash: data.baseline.tree.slice(0, 7) }))
                  : null)
            : null,
          data?.workspace?.partial
            ? h('div', { className: 'sc-notice' }, text('panel.partial'))
            : null,
          data?.workspace?.truncated
            ? h('div', { className: 'sc-notice' },
                text('panel.truncatedRepos', { n: data.workspace.repositoryCount }))
            : null,
          state.error && data
            ? h('div', { className: 'sc-notice' }, state.error)
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
        buildChangeTree,
        directoryStatus,
        filterChangeFiles,
        grouping,
      }
    }
    return plugin
  },
})
