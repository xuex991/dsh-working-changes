export class GitError extends Error {
  constructor(message, detail = {}) {
    super(message)
    this.name = 'GitError'
    this.code = detail.code ?? 'git-failed'
    this.stdout = detail.stdout ?? ''
    this.stderr = detail.stderr ?? ''
    this.exitCode = detail.exitCode ?? null
  }
}

export function cleanGitEnv(extra = {}) {
  const env = {
    GIT_TERMINAL_PROMPT: '0',
    GIT_PAGER: 'cat',
    GIT_OPTIONAL_LOCKS: '0',
    LC_ALL: 'C',
    LANG: 'C',
  }
  for (let index = 0; index < 16; index += 1) {
    env[`GIT_CONFIG_KEY_${index}`] = undefined
    env[`GIT_CONFIG_VALUE_${index}`] = undefined
  }
  env.GIT_CONFIG_COUNT = undefined
  return { ...env, ...extra }
}

export function gitFailure(argv, result) {
  const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
  return new GitError(
    `git ${argv.slice(1).join(' ')} failed: ${detail.slice(0, 4000) || 'no output'}`,
    {
      code: 'git-failed',
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.code,
    },
  )
}

function parseNumberStat(record) {
  const first = record.indexOf('\t')
  const second = first === -1 ? -1 : record.indexOf('\t', first + 1)
  if (first === -1 || second === -1) return null
  const additions = record.slice(0, first)
  const deletions = record.slice(first + 1, second)
  return {
    additions: additions === '-' ? null : Number(additions),
    deletions: deletions === '-' ? null : Number(deletions),
    rest: record.slice(second + 1),
  }
}

export function parseNameStatus(raw) {
  const parts = String(raw ?? '').split('\0')
  const entries = []
  for (let index = 0; index < parts.length;) {
    const code = parts[index++]
    if (!code) continue
    const letter = code[0]
    if (letter === 'R' || letter === 'C') {
      const oldPath = parts[index++]
      const path = parts[index++]
      if (path) entries.push({ status: letter, path, oldPath: oldPath || null })
      continue
    }
    const path = parts[index++]
    if (path) entries.push({ status: letter, path, oldPath: null })
  }
  return entries
}

export function parseNumstat(raw) {
  const parts = String(raw ?? '').split('\0')
  const stats = new Map()
  for (let index = 0; index < parts.length;) {
    const record = parts[index++]
    if (!record) continue
    const parsed = parseNumberStat(record)
    if (!parsed) continue
    let path = parsed.rest
    if (!path) {
      index += 1
      path = parts[index++] ?? ''
    }
    if (!path) continue
    stats.set(path, {
      additions: parsed.additions,
      deletions: parsed.deletions,
    })
  }
  return stats
}

export function parsePorcelainStatus(raw) {
  const parts = String(raw ?? '').split('\0')
  const entries = new Map()
  for (let index = 0; index < parts.length;) {
    const record = parts[index++]
    if (!record || record.length < 4) continue
    const x = record[0]
    const y = record[1]
    const path = record.slice(3)
    if (!path) continue
    const renamed = x === 'R' || x === 'C' || y === 'R' || y === 'C'
    const oldPath = renamed ? (parts[index++] || null) : null
    const untracked = x === '?' && y === '?'
    entries.set(path, {
      stageStatus: x === ' ' || x === '?' || x === '!' ? null : x,
      worktreeStatus: y === ' ' || y === '?' || y === '!' ? null : y,
      untracked,
      conflicted: x === 'U' || y === 'U' || record.startsWith('AA') || record.startsWith('DD'),
      oldPath,
    })
  }
  return entries
}

export function parseCommitLog(raw) {
  const commits = []
  for (const chunk of String(raw ?? '').split('\x1e')) {
    const record = chunk.replace(/^\r?\n/, '')
    if (!record) continue
    const fields = record.split('\x1f')
    if (fields.length < 5 || !/^[0-9a-f]{40,64}$/i.test(fields[0])) continue
    commits.push({
      sha: fields[0],
      parents: fields[1] ? fields[1].split(' ').filter(Boolean) : [],
      timestamp: Number(fields[2]) || 0,
      author: fields[3],
      subject: fields[4],
    })
  }
  return commits
}

const HUNK_HEADER = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/

export function parseUnifiedDiff(raw) {
  const hunks = []
  let current = null
  let oldLine = 0
  let newLine = 0
  let additions = 0
  let deletions = 0
  let binary = false

  for (const line of String(raw ?? '').split('\n')) {
    if (line.startsWith('Binary files ') && line.endsWith(' differ')) {
      binary = true
      continue
    }
    if (line.startsWith('diff --git ')) {
      current = null
      continue
    }
    const header = HUNK_HEADER.exec(line)
    if (header) {
      oldLine = Number(header[1])
      newLine = Number(header[3])
      current = { header: line, lines: [] }
      hunks.push(current)
      continue
    }
    if (!current) continue
    if (line === '') {
      current.lines.push({ kind: 'ctx', text: '', old: oldLine, new: newLine })
      oldLine += 1
      newLine += 1
      continue
    }
    const marker = line[0]
    if (marker === '+') {
      current.lines.push({ kind: 'add', text: line.slice(1), new: newLine })
      additions += 1
      newLine += 1
    } else if (marker === '-') {
      current.lines.push({ kind: 'del', text: line.slice(1), old: oldLine })
      deletions += 1
      oldLine += 1
    } else if (marker === ' ') {
      current.lines.push({ kind: 'ctx', text: line.slice(1), old: oldLine, new: newLine })
      oldLine += 1
      newLine += 1
    } else if (marker === '\\') {
      current.lines.push({ kind: 'meta', text: line })
    }
  }

  return { binary, additions, deletions, hunks }
}
