import type { RootContentNames } from 'mdast'
import type { Editor, Extension } from 'prosekit/core'
import type { CreateDecorationsAction } from '../sync'
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
