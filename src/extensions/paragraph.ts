import { defineNodeSpec, type Extension, type ParagraphExtension } from 'prosekit/core'
export { defineParagraph } from 'prosekit/core'
import { registerAstFrom } from '../markdown/methods'
import type { Attrs } from 'prosekit/pm/model'

type ParagraphSpecExtension = Extension<{
  Nodes: {
    paragraph: Attrs
  }
}>

export function defineParagraphSpec(): ParagraphSpecExtension {
  return defineNodeSpec({
    name: 'paragraph',
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM() {
      return ['p', 0]
    },
  })
}

export const astParagraphFrom = registerAstFrom<ParagraphExtension>()(
  'paragraph',
  (ctx, ast, text, _pos, marks) => {
    const childNodes = ctx.processPhrasingContent(ast, text, marks)
    return ctx.editor.nodes.paragraph(...childNodes)
  }
)
