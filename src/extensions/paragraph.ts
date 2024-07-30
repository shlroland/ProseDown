import { type Extension, defineNodeSpec } from 'prosekit/core'
export { defineParagraph } from 'prosekit/core'
import type { StringContent } from 'mdast'
import type { Attrs } from 'prosekit/pm/model'
import {
  registerAstFrom,
  registerAstTo,
  registerRemarkPlugin,
} from '../markdown/methods'
import { sanitizerText } from '../markdown/utils'

export type ParagraphExtension = Extension<{
  Nodes: {
    paragraph: Attrs
  }
}>

export function defineParagraphSpec(): ParagraphExtension {
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

export const stringToMarkdownPlugin = registerRemarkPlugin('stringContent', {
  plugin: function () {
    const data = this.data()
    if (!data.toMarkdownExtensions) {
      data.toMarkdownExtensions = []
    }

    data.toMarkdownExtensions.push({
      handlers: {
        stringContent: (node: StringContent) => {
          return node.value
        },
      },
    })
  },
})

export const astParagraphFrom = registerAstFrom<ParagraphExtension>()(
  'paragraph',
  (ctx, ast, text, _pos, marks) => {
    const childNodes = ctx.fromPhrasingContent(ast, text, marks)
    return ctx.editor.nodes.paragraph(...childNodes)
  },
)

export const astParagraphTo = registerAstTo('paragraph', (_ctx, node) => {
  const text = sanitizerText(node.textContent)
  return {
    type: 'paragraph',
    children: [{ type: 'stringContent', value: text }],
  }
})
