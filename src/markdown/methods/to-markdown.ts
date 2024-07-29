import type { RootContent } from 'mdast'
import type { ProseMirrorNode } from 'prosekit/pm/model'
import type { MarkdownProcessor } from '..'
import type { Editor } from 'prosekit/core'

export function toMarkdownAst(
  ctx: MarkdownProcessor<Editor>,
  node: ProseMirrorNode,
) {
  const result: RootContent[] = []

  node.forEach((child) => {
    const astToAction = ctx.astTo.get(child.type.name)
    if (astToAction) {
      const mdastNode = astToAction(ctx, child, result.at(-1))
      mdastNode && result.push(mdastNode)
    } else {
      throw new Error(`[toMarkdown]: not support type '${child.type.name}'`)
    }
  })
  return result
}
