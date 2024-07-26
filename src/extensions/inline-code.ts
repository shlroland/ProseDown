import { defineMarkSpec, type Extension } from 'prosekit/core'
import { registerAstFrom } from '../markdown/methods'
import type { Attrs } from 'prosekit/pm/model'

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
        inlineCode: Attrs;
    };
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
