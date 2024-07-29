import { defineMarkSpec, type Extension } from 'prosekit/core'
import { registerAstFrom, registerDecorationsAction } from '../markdown/methods'
import type { Attrs } from 'prosekit/pm/model'
import { createIndicatorDecorations } from '../markdown/sync'

export function defineEmphasis() {
  return defineMarkSpec({
    name: 'emphasis',
    inclusive: false,
    parseDOM: [
      { tag: 'i' },
      { tag: 'em' },
      {
        style: 'font-style',
        getAttrs: (value) => (value === 'italic') as false,
      },
    ],
    toDOM: () => ['em', 0],
  })
}

type EmphasisExtension = Extension<{
  Marks: {
    emphasis: Attrs
  }
}>

export const astEmphasisFrom = registerAstFrom<EmphasisExtension>()(
  'emphasis',
  (ctx, ast, text) => {
    const strongAction = ctx.editor.marks.emphasis
    return ctx.fromIndicatorContent(strongAction, ast, text)
  },
)

export const decorationEmphasis = registerDecorationsAction(
  'emphasis',
  (pos, node, info, actionMap) =>
    createIndicatorDecorations(pos, node, info, actionMap),
)
