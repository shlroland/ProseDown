import { defineMarkSpec, type Extension, type NodeChild } from 'prosekit/core'
import { registerAstFrom } from '../markdown/methods'

type LinkSpecExtension = Extension<{
  Marks: {
    link: {
      href: string
      title?: string
    }
  }
}>

export function defineLinkSpec() {
  return defineMarkSpec({
    name: 'link',
    inclusive: false,
    attrs: {
      href: { default: '' },
      title: { default: undefined },
    },
    parseDOM: [
      {
        tag: 'a[href]',
        getAttrs: (dom) => {
          return {
            href: (dom as HTMLElement).getAttribute('href'),
          }
        },
      },
    ],
    toDOM: (mark) => ['a', { ...mark.attrs }, 0],
  })
}

export function defineLink() {
  return defineLinkSpec()
}

export const astLinkFrom = registerAstFrom<LinkSpecExtension>()(
  'link',
  (ctx, ast, text) => {
    const link = (...children: NodeChild[]) =>
      ctx.editor.marks.link({ href: ast.url, title: ast.title ?? undefined }, ...children)
    return ctx.processIndicatorContent(link, ast, text)
  }
)
