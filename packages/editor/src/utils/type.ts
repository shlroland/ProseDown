import type { IsAny } from 'type-fest'

export type ExtractFirst<T extends readonly [string, unknown][]> = T[number][0]

export type RemoveNonCallable<T> = T extends (...args: any[]) => any
  ? (...args: Parameters<T>) => ReturnType<T>
  : never

/**
 * An extension of Extract for type predicates which falls back to the base
 * in order to narrow the `unknown` case.
 *
 * @example
 *   function isMyType<T>(data: T | MyType): data is NarrowedTo<T, MyType> { ... }
 */
export type NarrowedTo<T, Base> = Extract<T, Base> extends never
  ? Base
  : IsAny<T> extends true
    ? Base
    : Extract<T, Base>

export type DefinitelyFunction<T> = Extract<T, Function> extends never
  ? Function
  : Extract<T, Function>
