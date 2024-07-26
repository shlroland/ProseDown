import { defineMarkSpec } from 'prosekit/core'
import { registerAstFrom } from '../markdown/methods'

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

type InlineCodeExtension = ReturnType<typeof defineInlineCode>

export const astInlineCodeFrom = registerAstFrom<InlineCodeExtension>()(
  'inlineCode',
  (ctx, ast) => {
    const value = ctx.createTextNode(ast.value)
    const firstIndicator = ctx.createTextNode('`')
    const lastIndicator = ctx.createTextNode('`')
    return ctx.editor.marks.inlineCode([firstIndicator, value, lastIndicator])
  }
)
