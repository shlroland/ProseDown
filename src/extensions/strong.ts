import { defineMarkSpec } from 'prosekit/core'
import { isString } from 'remeda'
import { registerAstFrom } from '../markdown/methods'

export function defineStrong() {
  return defineMarkSpec({
    name: 'strong',
    inclusive: false,
    parseDOM: [
      { tag: 'strong' },
      { tag: 'b' },
      {
        style: 'font-weight',
        getAttrs: (node) =>
          isString(node) && /^(bold(er)?|[5-9]\d{2,})$/.test(node) ? null : false,
      },
    ],
    toDOM: () => {
      return ['strong', 0]
    },
  })
}

type StrongExtension = ReturnType<typeof defineStrong>

export const astStrongFrom = registerAstFrom<StrongExtension>()(
  'strong',
  (ctx, ast, text) => {
    const strongAction = ctx.editor.marks.strong

    return ctx.processIndicatorContent(strongAction, ast, text)
  }
)
