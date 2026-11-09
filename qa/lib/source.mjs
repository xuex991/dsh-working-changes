/** Extract a function body from JS source by balanced braces (good enough for tests). */
export function extractFunction(source, name) {
  const pattern = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`)
  const match = pattern.exec(source)
  if (!match) return ''
  const open = source.indexOf('{', match.index)
  if (open === -1) return ''
  let depth = 0
  for (let index = open; index < source.length; index += 1) {
    const char = source[index]
    if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return source.slice(match.index, index + 1)
    }
  }
  return source.slice(match.index)
}
