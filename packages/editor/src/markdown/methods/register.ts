import type { PhrasingContentMap, RootContentNames } from 'mdast'
import type { Editor, Extension } from 'prosekit/core'
import type { CreateDecorationsAction } from '../sync'
import type {
  IndicatorAction,
  IndicatorMarkAction,
  IndicatorNodeAction,
} from '../sync/types'
import type { AstFromAction, AstToAction, RemarkPlugin } from '../types'

export const registerRemark = (name: string | symbol, plugin: RemarkPlugin) => {
  return [name, plugin]
}

export const registerAstFrom =
  <E extends Extension>() =>
  <T extends RootContentNames>(
    type: T,
    fn: AstFromAction<T, Editor<E>>,
  ): (() => [T, AstFromAction<T, Editor<E>>]) => {
    return () => [type, fn]
  }

export const registerAstTo = <E extends Editor = Editor>(
  type: string,
  fn: AstToAction<E>,
): (() => [string, AstToAction<E>]) => {
  return () => [type, fn]
}

export const registerRemarkPlugin =
  (
    name: string | symbol,
    plugin: RemarkPlugin,
  ): (() => [string | symbol, RemarkPlugin]) =>
  () => [name, plugin]

export const registerDecorationsAction =
  <T extends RootContentNames>(
    name: T,
    fn: CreateDecorationsAction<T>,
  ): (() => [T, CreateDecorationsAction]) =>
  () => [name, fn]

export function registerIndicatorContent<
  T extends Exclude<keyof PhrasingContentMap, 'inlineMath' | 'text'>,
>(name: T, indicator: IndicatorMarkAction): () => [T, IndicatorMarkAction]
export function registerIndicatorContent<
  T extends Extract<keyof PhrasingContentMap, 'inlineMath' | 'text'>,
>(name: T, indicator: IndicatorNodeAction): () => [T, IndicatorNodeAction]
export function registerIndicatorContent<T extends keyof PhrasingContentMap>(
  name: T,
  indicator: IndicatorAction,
): () => [T, IndicatorAction] {
  if (name !== 'inlineMath') return () => [name, indicator]
  return () => [name, indicator]
}
