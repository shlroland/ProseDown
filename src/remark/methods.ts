import type { Editor, Extension, ExtensionTyping } from 'prosekit/core'
import type { AstFromAction, RemarkPlugin, RootContentNames } from './types'

export const registerRemark = (name: string | symbol, plugin: RemarkPlugin) => {
  return [name, plugin]
}

export const registerAstFrom = <
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  E extends Extension<ExtensionTyping<any, any, any>>,
  T extends RootContentNames
>(
  fn: (ctx: Editor<E>) => [T, AstFromAction<T>]
) => {
  return fn
}

export const register
