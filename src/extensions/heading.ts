import type { Heading } from 'mdast'
import { type Extension, defineNodeSpec } from 'prosekit/core'
import { registerAstFrom, registerAstTo } from '../markdown/methods'
import { extractTextContent } from '../markdown/utils'

type HeadingSpecExtension = Extension<{
  Nodes: {
    heading: {
      level: 1 | 2 | 3 | 4 | 5 | 6
    }
  }
}>

function defineHeadingSpec() {
  return defineNodeSpec({
    name: 'heading',
    attrs: { level: { default: 1 } },
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
      { tag: 'h4', attrs: { level: 4 } },
      { tag: 'h5', attrs: { level: 5 } },
      { tag: 'h6', attrs: { level: 6 } },
    ],
    toDOM(node) {
      return [`h${node.attrs.level}`, 0]
    },
  })
}

export function defineHeading() {
  return defineHeadingSpec()
}

export const astHeadingFrom = registerAstFrom<HeadingSpecExtension>()(
  'heading',
  (ctx, ast) => {
    const headingText = extractTextContent(ast)
    const headingTextNode = ctx.createTextNode(headingText)
    const heading = ctx.editor.nodes.heading
    return heading({ level: ast.depth }, headingTextNode)
  },
)

export const astHeadingTo = registerAstTo('heading', (ctx, node, prevNode) => {
  const paragraph = ctx.astTo.get('paragraph')
  if (!paragraph) throw new Error('must have a `astTo` method for `paragraph`')
  const result = paragraph(ctx, node, prevNode) as Heading
  result.type = 'heading'
  result.depth = node.attrs.level
  return result
})
