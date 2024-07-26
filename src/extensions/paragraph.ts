import type { defineParagraph } from 'prosekit/core'
export { defineParagraph } from 'prosekit/core'
import { registerAstFrom } from '../markdown/methods'


type ParagraphExtension = ReturnType<typeof defineParagraph>

export const astParagraphFrom = registerAstFrom<ParagraphExtension>()(
  'paragraph',
  (ctx, ast, text, _pos, marks) => {
    const childNodes = ctx.processPhrasingContent(ast, text, marks)
    return ctx.editor.nodes.paragraph(...childNodes)
  }
)
