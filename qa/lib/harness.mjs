import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export const asserts = []
export const observations = []
export const metrics = []

export function assertion(def) {
  asserts.push(def)
}

export function observe(def) {
  observations.push(def)
}

export function metric(def) {
  metrics.push(def)
}

export function ok(detail = '') {
  return { ok: true, detail }
}

export function bad(detail) {
  return { ok: false, detail }
}

export function expect(condition, failDetail, passDetail = '') {
  return condition ? ok(passDetail) : bad(failDetail)
}

export function fmtMs(value) {
  return `${value.toFixed(0)} ms`
}

export async function writeFileSafe(path, content) {
  await writeFile(path, content, 'utf8')
}

export { join }
