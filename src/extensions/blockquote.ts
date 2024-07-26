import { defineNodeSpec, type Extension } from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'
import { registerAstFrom } from '../markdown/methods'

export function defineBlockquoteSpec() {
  return defineNodeSpec({
    name: 'blockquote',
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM() {
      return ['blockquote', 0]
    },
  })
}

type BlockquoteExtension = Extension<{
  Nodes: {
    blockquote: Attrs
  }
}>

export const astBlockquoteFrom = registerAstFrom<BlockquoteExtension>()(
  'blockquote',
  (ctx, ast, text) => {
    const nodes = ctx.processParentContent(ast, text)
    const blockquote = ctx.editor.nodes.blockquote
    return blockquote(...nodes)
  }
)
