import { type Extension, defineNodeSpec } from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'
import { remarkInlineKeeper } from 'remark-inline-keeper'
import {
  registerAstFrom,
  registerIndicatorContent,
  registerRemarkPlugin,
} from '../../markdown/methods'

export function defineText() {
  return defineNodeSpec({
    name: 'text',
    group: 'inline',
  })
}

export type TextExtension = Extension<{
  Nodes: {
    text: Attrs
  }
}>

export const astTextFrom = registerAstFrom<TextExtension>()(
  'text',
  (ctx, ast) => {
    return ctx.createTextNode(ast.value)
  },
)

export const inlineKeeperRemark = registerRemarkPlugin('inlineKeeper', [
  remarkInlineKeeper,
])

export const textIndicator = registerIndicatorContent(
  'text',
  (node) => node.text ?? '',
)
