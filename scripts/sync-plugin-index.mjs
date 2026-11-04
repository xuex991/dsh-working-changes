import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const PLUGINS = [
  {
    key: 'working',
    name: 'dsh-working-changes',
    title: {
      en: 'Working Changes',
      zh: '当前变更',
    },
    description: {
      en: "Inspect current changes, review this session's local branch commits, and view commit content diffs in the DSH right sidebar.",
      zh: '在 DSH 右侧栏查看当前变更、本 Session 各本地分支的 Commit，以及提交内容 diff。',
    },
    icon: 'icons/working-changes.svg',
    homepage: 'https://github.com/xuex991/dsh-working-changes#readme',
    repository: 'https://github.com/xuex991/dsh-working-changes',
  },
  {
    key: 'readable',
    name: 'dsh-readable-output',
    title: {
      en: 'Readable Output',
      zh: '可读输出',
    },
    description: {
      en: 'Adds an always-on output contract for direct, concise answers in the DSH system prompt.',
      zh: '为 DSH system prompt 增加始终生效的输出约定：先答结论、少术语、简洁且明确标注不确定性。',
    },
    icon: 'icons/readable-output.svg',
    homepage: 'https://github.com/xuex991/dsh-readable-output#readme',
    repository: 'https://github.com/xuex991/dsh-readable-output',
  },
]

function argumentValue(argv, name) {
  const index = argv.indexOf(name)
  if (index === -1) return null
  const value = argv[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`)
  return value
}

function git(repo, args, options = {}) {
  const result = execFileSync('git', ['-C', repo, ...args], {
    encoding: 'utf8',
    stdio: options.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  })
  return options.inherit ? '' : result.trim()
}

function repositoryOrigin(repo, name) {
  const origin = git(repo, ['remote', 'get-url', 'origin'])
  const normalized = origin.replace(/\.git$/, '').replace(/\/$/, '')
  if (!normalized.endsWith(`/${name}`) && !normalized.endsWith(`:${name}`)) {
    throw new Error(`${repo}: origin must point to ${name}, found ${origin}`)
  }
  return origin
}

async function sourceFor(plugin, repo, { verifyPublished }) {
  const status = git(repo, ['status', '--porcelain', '--untracked-files=all'])
  if (status) {
    throw new Error(`${repo}: commit or stash changes before publishing the catalog`)
  }

  const packageJson = JSON.parse(await readFile(resolve(repo, 'package.json'), 'utf8'))
  if (packageJson.name !== plugin.name) {
    throw new Error(`${repo}: package name must be ${plugin.name}`)
  }
  repositoryOrigin(repo, plugin.name)

  const commit = git(repo, ['rev-parse', 'HEAD'])
  if (verifyPublished) {
    const remote = git(repo, ['ls-remote', 'origin', 'refs/heads/main']).split(/\s+/)[0]
    if (remote !== commit) {
      throw new Error(`${repo}: HEAD ${commit.slice(0, 7)} is not pushed to origin/main`)
    }
  }

  return {
    ...plugin,
    version: packageJson.version,
    commit,
    engines: packageJson.engines?.dsh ? { dsh: packageJson.engines.dsh } : {},
  }
}

export function buildCatalog(sources, publishTimestamp = Math.floor(Date.now() / 1000)) {
  if (sources.length !== PLUGINS.length) {
    throw new Error(`Expected ${PLUGINS.length} plugin sources`)
  }
  return {
    format: 1,
    title: {
      en: 'xue1991 DSH Plugins',
      zh: 'xue1991 DSH 插件',
    },
    description: {
      en: 'Small, focused plugins for DeepSeek Harness.',
      zh: '为 DeepSeek Harness 制作的小而专注的插件。',
    },
    plugins: sources.map((source) => ({
      name: source.name,
      title: source.title,
      description: source.description,
      icon: source.icon,
      author: 'xue1991',
      homepage: source.homepage,
      repository: { url: source.repository },
      versions: [{
        version: source.version,
        publishTimestamp,
        source: {
          type: 'git',
          url: source.repository,
          commit: source.commit,
        },
        engines: source.engines,
      }],
    })),
  }
}

export function validateCatalog(catalog) {
  if (catalog?.format !== 1 || !Array.isArray(catalog.plugins)) {
    throw new Error('Catalog must use format 1 and contain plugins')
  }
  const names = new Set()
  for (const plugin of catalog.plugins) {
    if (!plugin.name || names.has(plugin.name)) throw new Error(`Invalid plugin name: ${plugin.name}`)
    names.add(plugin.name)
    const latest = plugin.versions?.[0]
    if (!latest || !/^\d+\.\d+\.\d+(?:[-+].+)?$/.test(latest.version)) {
      throw new Error(`${plugin.name}: invalid version`)
    }
    if (!Number.isInteger(latest.publishTimestamp)) {
      throw new Error(`${plugin.name}: invalid publishTimestamp`)
    }
    if (!/^[0-9a-f]{40}$/.test(latest.source?.commit || '')) {
      throw new Error(`${plugin.name}: invalid source commit`)
    }
  }
  return catalog
}

async function main() {
  const argv = process.argv.slice(2)
  const workingRepo = resolve(argumentValue(argv, '--working') || ROOT)
  const readableRepo = resolve(argumentValue(argv, '--readable') || resolve(ROOT, '..', 'dsh-readable-output'))
  const verifyPublished = !argv.includes('--allow-unpublished')

  const sources = []
  for (const plugin of PLUGINS) {
    const repo = plugin.key === 'working' ? workingRepo : readableRepo
    sources.push(await sourceFor(plugin, repo, { verifyPublished }))
  }

  if (!argv.includes('--skip-tests')) {
    for (const plugin of PLUGINS) {
      const repo = plugin.key === 'working' ? workingRepo : readableRepo
      console.log(`Testing ${plugin.name}…`)
      execFileSync('npm', ['test'], { cwd: repo, stdio: 'inherit' })
    }
  }

  const catalog = validateCatalog(buildCatalog(sources))
  await writeFile(resolve(ROOT, 'docs/index.json'), `${JSON.stringify(catalog, null, 2)}\n`)
  console.log('Updated docs/index.json')
  for (const source of sources) {
    console.log(`- ${source.name} ${source.version} @ ${source.commit.slice(0, 7)}`)
  }

  if (argv.includes('--commit')) {
    git(ROOT, ['add', 'docs/index.json'])
    git(ROOT, ['commit', '-m', 'chore: sync plugin catalog'], { inherit: true })
  }
  if (argv.includes('--push')) {
    const origin = git(ROOT, ['remote', 'get-url', 'origin'])
    const sshOrigin = origin
      .replace(/^https:\/\/github\.com\//, 'git@github.com:')
      .replace(/^git@github\.com:/, 'git@github.com:')
    git(ROOT, ['push', sshOrigin, 'HEAD:main'], { inherit: true })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
