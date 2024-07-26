// 提取每个元组的第一个元素并组合成联合类型
export type ExtractFirst<T extends readonly [string, unknown][]> = T[number][0]
