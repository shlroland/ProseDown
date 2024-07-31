import type { BlockContent, DefinitionContent } from 'mdast'
import { type Extension, defineNodeSpec } from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'
import { registerAstFrom, registerAstTo } from '../../markdown/methods'
import { isString } from '../../utils/is'

export function defineListItemSpec() {
  return defineNodeSpec({
    name: 'listItem',
    defining: true,
    content: '(paragraph block* | bulletList | orderedList)',
    attrs: {
      checked: {
        default: null,
        validate: 'null|boolean',
      },
    },
    parseDOM: [
      {
        tag: 'li',
        getAttrs: (node) => {
          if (isString(node)) {
            return false
          }
          const checked = node.getAttribute('checked')
          return { checked: checked ? checked === 'true' : null }
        },
      },
    ],
    toDOM: (node) => ['li', { checked: node.attrs.checked }, 0],
  })
}

type ListItemExtension = Extension<{
  Nodes: {
    listItem: {
      checked: null
    }
    paragraph: Attrs
  }
}>

export function defineListItem() {
  return defineListItemSpec()
}

export const astListItemFrom = registerAstFrom<ListItemExtension>()(
  'listItem',
  (ctx, ast, text) => {
    let nodes = ctx.fromParentContent(ast, text)
    const listItem = ctx.editor.nodes.listItem
    if (nodes.length <= 0) {
      nodes = [ctx.editor.nodes.paragraph()]
    }
    return listItem(...nodes)
  },
)

export const astListItemTo = registerAstTo('listItem', (ctx, node) => {
  return {
    type: 'listItem',
    checked: node.attrs.checked,
    children: ctx.toMarkdownAst(node) as (BlockContent | DefinitionContent)[],
  }
})
