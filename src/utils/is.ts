import type { DefinitelyFunction, NarrowedTo } from './type'

export function isArray<T>(
  data: ArrayLike<unknown> | T,
): data is NarrowedTo<T, ReadonlyArray<unknown>> {
  return Array.isArray(data)
}

export function isString<T>(data: T | string): data is NarrowedTo<T, string> {
  return typeof data === 'string'
}

export function isFunction<T>(
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  data: Function | T,
): data is DefinitelyFunction<T> {
  return typeof data === 'function'
}
