import { defineNodeSpec, union, type Extension } from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'
import { registerAstFrom, registerAstTo } from '../markdown/methods'
import type { ListItem } from 'mdast'

export function defineBulletListSpec() {
  return defineNodeSpec({
    name: 'bulletList',
    content: 'listItem+',
    group: 'block',
    parseDOM: [{ tag: 'ul' }],
    toDOM() {
      return ['ul', 0]
    },
  })
}

export function defineOrderedListSpec() {
  return defineNodeSpec({
    name: 'orderedList',
    attrs: {
      order: { default: 1, validate: 'number' },
    },
    group: 'block',
    content: 'listItem+',
    parseDOM: [
      {
        tag: 'ol',
        getAttrs(node) {
          return node instanceof HTMLElement
            ? {
                order: node.hasAttribute('start')
                  ? Number(node.getAttribute('start'))
                  : 1,
              }
            : false
        },
      },
    ],
    toDOM(node) {
      return ['ol', { start: node.attrs.order }, 0]
    },
  })
}

export function defineList() {
  return union([defineBulletListSpec(), defineOrderedListSpec()])
}

type ListExtension = Extension<{
  Nodes: {
    bulletList: Attrs
    orderedList: { order: number }
    paragraph: Attrs
  }
}>

export const astListFrom = registerAstFrom<ListExtension>()(
  'list',
  (ctx, ast, text) => {
    const { paragraph, orderedList, bulletList } = ctx.editor.nodes
    const childNodes = ctx.fromParentContent(ast, text)
    if (childNodes.length < 0) return [paragraph()]
    if (ast.ordered) {
      return orderedList({ order: ast.start! }, ...childNodes)
    }
    return bulletList(...childNodes)
  }
)

export const astBulletListTo = registerAstTo('bulletList', (ctx, node) => {
  return {
    type: 'list',
    spread: node.content.size > 1,
    children: ctx.toMarkdownAst(node) as ListItem[],
  }
})

export const astOrderedListTo = registerAstTo('orderedList', (ctx, node) => {
  return {
    type: 'list',
    ordered: true,
    start: node.attrs.order,
    spread: node.content.size > 1,
    children: ctx.toMarkdownAst(node) as ListItem[],
  }
})
