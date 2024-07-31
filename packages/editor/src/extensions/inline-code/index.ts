import { type Extension, defineMarkSpec } from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'
import {
  registerAstFrom,
  registerDecorationsAction,
  registerIndicatorContent,
} from '../../markdown/methods'
import { calcNodePosition, createMarkDecoration } from '../../markdown/sync'

export function defineInlineCode() {
  return defineMarkSpec({
    name: 'inlineCode',
    inclusive: false,
    excludes: '_',
    parseDOM: [{ tag: 'code' }],
    toDOM() {
      return ['code', 0]
    },
  })
}

type InlineCodeExtension = Extension<{
  Marks: {
    inlineCode: Attrs
  }
}>

export const astInlineCodeFrom = registerAstFrom<InlineCodeExtension>()(
  'inlineCode',
  (ctx, ast) => {
    const value = ctx.createTextNode(ast.value)
    const firstIndicator = ctx.createTextNode('`')
    const lastIndicator = ctx.createTextNode('`')
    return ctx.editor.marks.inlineCode([firstIndicator, value, lastIndicator])
  }
)

export const decorationInlineCode = registerDecorationsAction(
  'inlineCode',
  (pos, node, info) => {
    const [nodeStartPos, nodeEndPos] = calcNodePosition(pos, node)
    return [
      createMarkDecoration(nodeStartPos, nodeStartPos + 1, info.isInRange),
      createMarkDecoration(nodeEndPos - 1, nodeEndPos, info.isInRange),
    ]
  }
)

export const inlineCodeIndicator = registerIndicatorContent(
  'inlineCode',
  () => ['`', '`']
)
