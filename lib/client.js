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
      'panel.notRepoHint': 'Session 变更需要一个 Git 工作区作为快照基础。',
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
      'panel.notRepoHint': 'Session Changes needs a Git workspace as its snapshot base.',
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
        grid-template-columns: minmax(218px, .78fr) minmax(0, 1.55fr);
      }
      .sc-listpane, .sc-detailpane { min-width: 0; min-height: 0; display: flex; flex-direction: column; }
      .sc-listpane { border-right: 1px solid var(--sc-line); background: color-mix(in srgb, var(--sc-card) 46%, transparent); }
      .sc-tools { flex: none; padding: 9px 10px 7px; border-bottom: 1px solid var(--sc-line); }
      .sc-search {
        width: 100%; height: 29px; padding: 0 10px; border-radius: 9px;
        border: 1px solid var(--sc-line-strong); background: var(--sc-base); color: var(--sc-ink);
        font: inherit; font-size: 11.5px; outline: none;
      }
      .sc-search:focus { border-color: var(--sc-blue); box-shadow: 0 0 0 3px var(--sc-blue-08); }
      .sc-search::placeholder { color: var(--sc-muted); }
      .sc-filters { display: flex; gap: 4px; flex-wrap: wrap; padding-top: 7px; }
      .sc-filter {
        height: 20px; padding: 0 7px; border-radius: 999px; cursor: pointer;
        border: 1px solid transparent; background: transparent; color: var(--sc-muted);
        font: 600 10px/1 var(--sc-mono);
      }
      .sc-filter:hover { background: var(--sc-hover); color: var(--sc-ink); }
      .sc-filter[data-active="true"] { background: var(--sc-blue-12); border-color: var(--sc-blue-20); color: var(--sc-blue); }
      .sc-filelist { flex: 1 1 0; min-height: 0; overflow: auto; padding: 4px 0 12px; }
      .sc-filelist::-webkit-scrollbar, .sc-diffscroll::-webkit-scrollbar { width: 10px; height: 10px; }
      .sc-filelist::-webkit-scrollbar-thumb, .sc-diffscroll::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--sc-blue) 24%, transparent);
        border: 3px solid transparent; border-radius: 99px; background-clip: content-box;
      }
      .sc-dir {
        position: sticky; top: 0; z-index: 1;
        display: flex; align-items: center; gap: 7px;
        height: 26px; padding: 0 11px;
        background: color-mix(in srgb, var(--sc-card) 94%, var(--sc-base));
        -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
        color: var(--sc-muted); font: 600 10px/1 var(--sc-mono);
        border-bottom: 1px solid color-mix(in srgb, var(--sc-line) 70%, transparent);
      }
      .sc-dir::before {
        content: ""; width: 5px; height: 5px; border-radius: 2px;
        background: var(--sc-blue); box-shadow: 0 0 0 3px var(--sc-blue-08);
      }
      .sc-dirname { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .sc-filerow {
        width: calc(100% - 10px); margin: 1px 5px; padding: 5px 7px;
        display: flex; align-items: center; gap: 7px; border: 0; border-radius: 8px;
        background: transparent; color: var(--sc-ink); text-align: left; cursor: pointer;
      }
      .sc-filerow:hover { background: var(--sc-hover); }
      .sc-filerow[data-selected="true"] {
        background: var(--sc-blue-12);
        box-shadow: inset 2px 0 0 var(--sc-blue);
      }
      .sc-filerow:focus-visible { outline: 2px solid var(--sc-blue-20); outline-offset: -1px; }
      .sc-status {
        width: 17px; height: 17px; border-radius: 5px; flex: none;
        display: inline-grid; place-items: center;
        background: var(--sc-blue-08); color: var(--sc-blue);
        font: 700 9.5px/1 var(--sc-mono);
      }
      .sc-status[data-status="M"] { color: var(--sc-warn); }
      .sc-status[data-status="A"] { color: var(--sc-ok); }
      .sc-status[data-status="D"], .sc-status[data-status="U"] { color: var(--sc-err); }
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
      .sc-detailpane { background: color-mix(in srgb, var(--sc-base) 96%, var(--sc-card)); }
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
      .sc-chevron { width: 13px; height: 13px; }
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
      @container (max-width: 680px) {
        .sc-workspace { grid-template-columns: minmax(0, 1fr); }
        .sc-workspace[data-detail="true"] { grid-template-rows: minmax(0, 1fr); }
        .sc-workspace[data-detail="true"] .sc-listpane { display: none; }
        .sc-workspace[data-detail="false"] .sc-detailpane { display: none; }
        .sc-workspace[data-detail="true"] .sc-detailpane { display: flex; }
        .sc-listpane { border-right: 0; }
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

    function bnClass(status) {
      return ['M', 'A', 'D', 'R', 'C', 'U'].includes(status) ? status : 'O'
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

      async function loadDiff(path, data, token) {
        if (!path || !data?.baseline?.tree || !data?.current) {
          set({ diff: null, diffLoading: false, diffError: null })
          return
        }
        set({ diffLoading: true, diffError: null })
        try {
          const diff = await rpc('diff', {
            cwd: data.repo.root,
            baselineTree: data.baseline.tree,
            currentTree: data.current,
            path,
          })
          if (token !== diffSequence || store.get().selected !== path) return
          set({ diff, diffLoading: false })
        } catch (error) {
          if (token !== diffSequence || store.get().selected !== path) return
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
          const stillExists = selected && data.files.some((file) => file.path === selected)
          set({
            loading: false,
            refreshing: false,
            data,
            error: null,
            selected: stillExists ? selected : null,
            diff: stillExists ? store.get().diff : null,
            diffError: null,
          })
          if (stillExists) void loadDiff(selected, data, ++diffSequence)
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

      function select(path) {
        const current = store.get().data
        const diffToken = ++diffSequence
        set({ selected: path, diff: null, diffError: null, diffLoading: false })
        if (current) void loadDiff(path, current, diffToken)
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
      const repo = state.data?.repo
      const summary = state.data?.summary
      const hasChanges = Boolean(summary && summary.files > 0)
      const branch = repo?.branch || (repo?.detached ? text('panel.detached') : null)
      const label = hasChanges
        ? text('panel.changedFiles', { n: summary.files })
        : repo?.isRepo
          ? text('panel.noChangesPill')
          : text('panel.title')
      const files = state.data?.files || []
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

      function openPanel(path, event) {
        event?.currentTarget?.blur()
        setOpen(false)
        if (closeTimer.current) clearTimeout(closeTimer.current)
        if (path) controller.select(path)
        else if (!state.selected && files[0]) controller.select(files[0].path)
        void controller.refresh()
        ctx.sidebarRight.openTab(TAB_KIND)
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
          title: branch ? `${text('panel.open')} · ${branch}` : text('panel.open'),
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
            h('strong', null, hasChanges ? text('panel.changedFiles', { n: summary.files }) : text('panel.noChangesPill')),
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
                  visibleFiles.map((file) => h('button', {
                    type: 'button',
                    key: file.path,
                    className: 'sc-hoverrow',
                    title: file.path,
                    onClick: (event) => openPanel(file.path, event),
                  },
                    h('span', {
                      className: 'sc-status',
                      'data-status': bnClass(file.status),
                      title: statusLabel(file.status),
                    }, file.status),
                    h('span', { className: 'sc-hovername' }, file.path),
                    h('span', { className: 'sc-hoverstat' },
                      file.binary
                        ? h('span', { style: { color: 'var(--sc-muted)' } }, 'bin')
                        : h(Fragment, null,
                            h('span', { className: 'sc-add' }, `+${file.additions ?? 0}`),
                            ' ',
                            h('span', { className: 'sc-del' }, `−${file.deletions ?? 0}`)))))),
                files.length > visibleFiles.length
                  ? h('div', { className: 'sc-hovermore' }, text('panel.moreFiles', { n: files.length - visibleFiles.length }))
                  : null)
            : h('div', { className: 'sc-hoverempty' }, text('panel.captureHint'))))
    }

    function grouping(files, filter, statusFilter) {
      const query = filter.trim().toLowerCase()
      const filtered = files.filter((file) => {
        if (statusFilter !== 'all' && bnClass(file.status) !== statusFilter) return false
        if (!query) return true
        return file.path.toLowerCase().includes(query) ||
          String(file.oldPath || '').toLowerCase().includes(query)
      })
      const groups = new Map()
      for (const file of filtered) {
        const slash = file.path.lastIndexOf('/')
        const dir = slash === -1 ? '.' : file.path.slice(0, slash)
        if (!groups.has(dir)) groups.set(dir, [])
        groups.get(dir).push(file)
      }
      return [...groups.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([dir, entries]) => ({
          dir,
          files: entries.sort((left, right) => left.path.localeCompare(right.path)),
        }))
    }

    function FileList({ data, controller, state }) {
      const [filter, setFilter] = useState('')
      const [statusFilter, setStatusFilter] = useState('all')
      const groups = useMemo(
        () => grouping(data.files, filter, statusFilter),
        [data.files, filter, statusFilter],
      )
      const statuses = useMemo(() => {
        const values = [...new Set(data.files.map((file) => bnClass(file.status)))]
        return ['all', ...values]
      }, [data.files])

      return h('div', { className: 'sc-listpane' },
        h('div', { className: 'sc-tools' },
          h('input', {
            className: 'sc-search',
            type: 'search',
            value: filter,
            placeholder: text('panel.filter'),
            'aria-label': text('panel.filter'),
            onChange: (event) => setFilter(event.target.value),
          }),
          statuses.length > 1
            ? h('div', { className: 'sc-filters', role: 'group', 'aria-label': text('panel.files', { n: data.files.length }) },
                statuses.map((status) => h('button', {
                  type: 'button',
                  key: status,
                  className: 'sc-filter',
                  'data-active': String(statusFilter === status),
                  title: status === 'all' ? text('panel.all') : statusLabel(status),
                  onClick: () => setStatusFilter(status),
                }, status === 'all' ? text('panel.all') : status)))
            : null),
        h('div', { className: 'sc-filelist', role: 'list' },
          groups.length === 0
            ? h(EmptyState, { title: text('panel.filterEmpty') })
            : groups.map((group) => h(Fragment, { key: group.dir },
                h('div', { className: 'sc-dir', title: group.dir === '.' ? '/' : group.dir },
                  h('span', { className: 'sc-dirname' }, group.dir === '.' ? '/' : group.dir),
                  h('span', { style: { marginLeft: 'auto', color: 'var(--sc-muted)' } }, String(group.files.length))),
                group.files.map((file) => h('button', {
                  type: 'button',
                  role: 'listitem',
                  key: file.path,
                  className: 'sc-filerow',
                  'data-selected': String(state.selected === file.path),
                  title: file.oldPath ? text('panel.renamed', { path: file.oldPath }) : file.path,
                  onClick: () => controller.select(file.path),
                },
                  h('span', {
                    className: 'sc-status',
                    'data-status': bnClass(file.status),
                    title: statusLabel(file.status),
                  }, file.status),
                  h('span', { className: 'sc-name' }, file.path.slice(file.path.lastIndexOf('/') + 1)),
                  file.binary
                    ? h('span', { className: 'sc-count' }, 'bin')
                    : h('span', { className: 'sc-count' },
                        h('span', { className: 'plus' }, `+${file.additions ?? 0}`),
                        ' ',
                        h('span', { className: 'minus' }, `−${file.deletions ?? 0}`)))))
            )))
    }

    function DiffView({ state, controller }) {
      const scroll = useRef(null)
      const selected = state.data?.files.find((file) => file.path === state.selected) || null
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
      return h('div', { className: 'sc-detailpane' },
        h('div', { className: 'sc-detailhead' },
          h('button', {
            type: 'button',
            className: 'sc-back',
            onClick: () => controller.clearSelection(),
          }, h(BackIcon), text('panel.back')),
          h('span', { className: 'sc-detailtitle', title: selected.path }, selected.path),
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
                retry: () => controller.select(selected.path),
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
      const summary = data?.summary
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
      } else if (repo && repo.isRepo === false) {
        body = h(EmptyState, {
          title: text('panel.notRepo'),
          hint: text('panel.notRepoHint'),
        })
      } else if (data && data.files.length === 0) {
        body = h(EmptyState, {
          title: text('panel.noChanges'),
          hint: data.captured ? text('panel.captureHint') : text('panel.selectHint'),
        })
      } else if (data) {
        body = h('div', { className: 'sc-workspace', 'data-detail': String(isDetail) },
          h(FileList, { data, controller, state }),
          h(DiffView, { state, controller }))
      } else {
        body = h(EmptyState, { title: text('panel.loading') })
      }

      const branch = repo?.branch
      return h('div', { className: 'sc-root' },
        h('header', { className: 'sc-header' },
          h('div', { className: 'sc-headline' },
            h(BranchIcon, { size: 16 }),
            h('span', { className: 'sc-title' }, text('panel.title')),
            branch
              ? h('span', { className: 'sc-branch', title: branch }, branch)
              : repo?.detached
                ? h('span', { className: 'sc-branch' }, text('panel.detached'))
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
                h('span', null, changeCountLabel(summary)),
                h(Stat, { summary }),
                h('span', { className: 'sc-spacer' }),
                data.baseline?.capturedAt
                  ? h('span', { title: text('panel.baseline') }, text('panel.capturedAt', { hash: data.baseline.tree.slice(0, 7) }))
                  : null)
            : null,
          state.error && data
            ? h('div', { className: 'sc-notice' }, state.error)
            : null),
        body)
    }

    function GuideIcon({ size = 16 }) {
      return h(BranchIcon, { size })
    }

    return {
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
  },
})
