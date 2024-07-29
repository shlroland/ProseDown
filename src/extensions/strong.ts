import { defineMarkSpec, type Extension } from 'prosekit/core'
import { registerAstFrom } from '../markdown/methods'
import type { Attrs } from 'prosekit/pm/model'
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
          isString(node) && /^(bold(er)?|[5-9]\d{2,})$/.test(node) ? null : false,
      },
    ],
    toDOM: () => {
      return ['strong', 0]
    },
  })
}

type StrongExtension = Extension<{
    Marks: {
        strong: Attrs;
    };
}>

export const astStrongFrom = registerAstFrom<StrongExtension>()(
  'strong',
  (ctx, ast, text) => {
    const strongAction = ctx.editor.marks.strong

    return ctx.fromIndicatorContent(strongAction, ast, text)
  }
)
