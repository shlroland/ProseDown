import { type Extension, defineMarkSpec } from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'
import { registerAstFrom, registerDecorationsAction } from '../markdown/methods'
import { createIndicatorDecorations } from '../markdown/sync'
import { isString } from '../utils/is'

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
          isString(node) && /^(bold(er)?|[5-9]\d{2,})$/.test(node)
            ? null
            : false,
      },
    ],
    toDOM: () => {
      return ['strong', 0]
    },
  })
}

type StrongExtension = Extension<{
  Marks: {
    strong: Attrs
  }
}>

export const astStrongFrom = registerAstFrom<StrongExtension>()(
  'strong',
  (ctx, ast, text) => {
    const strongAction = ctx.editor.marks.strong

    return ctx.fromIndicatorContent(strongAction, ast, text)
  },
)

export const decorationStrong = registerDecorationsAction(
  'strong',
  (pos, node, info, actionMap) =>
    createIndicatorDecorations(pos, node, info, actionMap),
)
