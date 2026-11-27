import type { Doc } from './types'

export type Path = ReadonlyArray<string | number>

export function pathKey(path: Path): string {
  return path.join('.')
}

export function getIn(source: unknown, path: Path): unknown {
  return path.reduce<unknown>((value, key) => {
    if (value === null || typeof value !== 'object') return undefined
    return (value as Record<string | number, unknown>)[key]
  }, source)
}

/** Returns a copy of `source` with the value at `path` replaced. */
export function setIn<T>(source: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T
  const [head, ...rest] = path as [string | number, ...Array<string | number>]
  const container: Doc | unknown[] = Array.isArray(source)
    ? [...source]
    : { ...((source as Doc | undefined) ?? {}) }
  const current = (container as Record<string | number, unknown>)[head]
  ;(container as Record<string | number, unknown>)[head] = setIn(current, rest, value)
  return container as T
}

export function textOf(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
