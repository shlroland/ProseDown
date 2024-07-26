export type ExtractFirst<T extends readonly [string, unknown][]> = T[number][0];

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type RemoveNonCallable<T> = T extends (...args: any[]) => any
  ? (...args: Parameters<T>) => ReturnType<T>
  : never;
