import { spawnSync } from 'node:child_process'

/** Fixture-only helper: run git synchronously in a fixture repo. */
export function git(cwd, ...args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
      GIT_CONFIG_NOSYSTEM: '',
    },
  })
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed in ${cwd}\n${result.stderr || result.stdout}`)
  }
  return result.stdout
}

export function initRepo(cwd, { branch = 'main', commit = true } = {}) {
  git(cwd, 'init', '-q', '-b', branch)
  git(cwd, 'config', 'user.email', 'qa@example.com')
  git(cwd, 'config', 'user.name', 'QA')
  git(cwd, 'config', 'commit.gpgsign', 'false')
  git(cwd, 'config', 'core.autocrlf', 'false')
  if (commit) commitAll(cwd, 'init')
}

export function commitAll(cwd, message) {
  git(cwd, 'add', '-A')
  git(cwd, 'commit', '-qm', message, '--no-gpg-sign')
}
