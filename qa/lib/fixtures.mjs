import { chmod, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { FIXTURE_ROOT } from './env.mjs'
import { commitAll, git, initRepo } from './git.mjs'

async function fresh(name) {
  const dir = join(FIXTURE_ROOT, name)
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  return dir
}

async function put(root, path, content) {
  const full = join(root, path)
  await mkdir(join(full, '..'), { recursive: true })
  await writeFile(full, content)
}

/** Rich single repo: every change kind the panel claims to render. */
export async function buildRich() {
  const dir = await fresh('rich')
  await put(dir, 'keep.txt', 'l1\nl2\nl3\n')
  await put(dir, 'mod.txt', 'a\nb\nc\n')
  await put(dir, 'del.txt', 'gone\n')
  await put(dir, 'old-name.txt', 'oldname\ncontent\n')
  await put(dir, 'bin.dat', Buffer.from([0x78, 0x00, 0x79, 0x00]))
  await put(dir, 'noeol.txt', 'no-eol')
  await put(dir, 'src/deep/f.txt', 'deep\n')
  await put(dir, 'src/deep/keep.txt', 'stable\n')
  await put(dir, 'docs/a b/space file.md', '# space\n')
  await put(dir, 'docs/中文.md', '# 中文\n')
  initRepo(dir)

  await put(dir, 'mod.txt', 'a\nB\nc\n')
  await put(dir, 'staged-new.txt', 'staged\n')
  await put(dir, 'keep.txt', 'l1\nl2\nl3')
  await chmod(join(dir, 'keep.txt'), 0o755)
  await rm(join(dir, 'del.txt'))
  await git(dir, 'mv', 'old-name.txt', 'new-name.txt')
  await put(dir, 'untracked.txt', 'untracked\n')
  await put(dir, 'src/deep/f.txt', 'deep2\n')
  await put(dir, 'noeol.txt', 'no-eol2')
  await put(dir, 'bin.dat', Buffer.from([0x79, 0x00, 0x7a, 0x00]))
  await put(dir, 'docs/a b/space file.md', '# space changed\n')
  await put(dir, 'docs/中文.md', '# 中文 changed\n')
  // untracked directories: git lists every file under them with -uall
  for (let i = 0; i < 60; i += 1) await put(dir, `gen/n${i}.txt`, `u${i}\n`)
  await git(dir, 'add', 'staged-new.txt')
  return dir
}

/** Rename + content edit: git status says R, git diff's similarity drops to D+A. */
export async function buildRenameEdit() {
  const dir = await fresh('rename-edit')
  await put(dir, 'src/report_daily.py', [
    'from stats import aggregate',
    '',
    '',
    'def daily(rows):',
    '    return aggregate(rows, window="1d")',
    '',
  ].join('\n'))
  await put(dir, 'src/stable.py', 'def stable():\n    return 1\n')
  initRepo(dir)
  await git(dir, 'mv', 'src/report_daily.py', 'src/report_daily_v2.py')
  // 改内容：相似度跌破 50%，git diff 会拆成 D + A
  await put(dir, 'src/report_daily_v2.py', [
    'from stats import aggregate, save',
    '',
    '',
    'def daily(rows, *, persist=True):',
    '    result = aggregate(rows, window="1d")',
    '    if persist:',
    '        save(result)',
    '    return result',
    '',
    '',
    'def weekly(rows):',
    '    return aggregate(rows, window="7d")',
    '',
  ].join('\n'))
  return dir
}

/** Repository with no commit yet (unborn HEAD). */
export async function buildUnborn() {
  const dir = await fresh('unborn')
  initRepo(dir, { commit: false })
  await put(dir, 'a.txt', 'hi\n')
  await put(dir, 'sub/b.txt', 'x\n')
  return dir
}

/** Container workspace: two independent repos plus a non-repo folder. */
export async function buildMulti() {
  const dir = await fresh('multi')
  for (const name of ['r1', 'r2']) {
    const root = join(dir, name)
    await mkdir(root, { recursive: true })
    await put(root, 'base.txt', 'base\n')
    initRepo(root)
    await put(root, 'base.txt', 'base\nmod\n')
  }
  await put(join(dir, 'r1'), 'with space.txt', 'sp\n')
  await put(join(dir, 'r1'), '文件 名.txt', 'uni\n')
  await mkdir(join(dir, 'plain'), { recursive: true })
  await put(join(dir, 'plain'), 'note.txt', 'note\n')
  return dir
}

/** Workspace is a subdirectory of the repository. */
export async function buildSubdir() {
  const dir = await fresh('subdir')
  await put(dir, 'top.txt', 'top\n')
  await put(dir, 'packages/app/a.txt', 'a\n')
  initRepo(dir)
  await put(dir, 'packages/app/a.txt', 'a\nchanged\n')
  return dir
}

/** Repository in an unmerged (conflicted) state. */
export async function buildConflict() {
  const dir = await fresh('conflict')
  await put(dir, 'conf.txt', 'base\n')
  initRepo(dir)
  await git(dir, 'checkout', '-q', '-b', 'other')
  await put(dir, 'conf.txt', 'theirs\n')
  commitAll(dir, 'theirs')
  await git(dir, 'checkout', '-q', 'main')
  await put(dir, 'conf.txt', 'ours\n')
  commitAll(dir, 'ours')
  try {
    await git(dir, 'merge', 'other')
  } catch {
    // expected: merge conflict
  }
  return dir
}

/** Large dirty repo used only for the performance metrics case. */
export async function buildBig({ modified = 300, untracked = 3000 } = {}) {
  const dir = await fresh('big')
  for (let i = 0; i < modified; i += 1) await put(dir, `f${i}.txt`, `base ${i}\n`)
  initRepo(dir)
  for (let i = 0; i < modified; i += 1) await put(dir, `f${i}.txt`, `base ${i}\nmod ${i}\n`)
  for (let i = 0; i < untracked; i += 1) await put(dir, `gen/u${i}.txt`, `u${i}\n`)
  return dir
}
