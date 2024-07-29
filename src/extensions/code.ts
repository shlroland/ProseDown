import { defineNodeSpec, type Extension } from 'prosekit/core'
import { registerAstFrom, registerAstTo } from '../markdown/methods'
import { isString } from '../utils/is'

export function defineCodeSpec() {
  return defineNodeSpec({
    name: 'code',
    marks: '',
    content: 'text*',
    group: 'block',
    defining: true,
    code: true,
    attrs: {
      lang: {
        default: 'plain',
        validate: 'string|null|undefined',
      },
      meta: {
        default: null,
        validate: 'string|null|undefined',
      },
    },
    parseDOM: [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: (node) =>
          isString(node)
            ? null
            : {
                lang: node.getAttribute('lang'),
                meta: node.getAttribute('meta'),
              },
      },
    ],
    toDOM: (node) => ['pre', node.attrs, ['code', 0]],
  })
}

type CodeExtension = Extension<{
  Nodes: {
    code: {
      lang: string | null | undefined
      meta: null | string | undefined
    }
  }
}>

export function defineCode() {
  return defineCodeSpec()
}

export const astCodeFrom = registerAstFrom<CodeExtension>()(
  'code',
  (ctx, ast) => {
    const codeText = ast.value
    return ctx.editor.nodes.code({ lang: ast.lang, meta: ast.meta }, codeText)
  }
)

export const astCodeTo = registerAstTo('code', (_ctx, node) => {
  return {
    type: 'code',
    meta: null,
    lang: node.attrs.lang,
    value: node.textContent,
  }
})
