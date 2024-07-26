import { defineMarkSpec } from 'prosekit/core'
import { registerAstFrom } from '../markdown/methods'

export function defineEmphasis() {
  return defineMarkSpec({
    name: 'emphasis',
    inclusive: false,
    parseDOM: [
      { tag: 'i' },
      { tag: 'em' },
      { style: 'font-style', getAttrs: (value) => (value === 'italic') as false },
    ],
    toDOM: () => ['em', 0],
  })
}

type EmphasisExtension = ReturnType<typeof defineEmphasis>

export const astEmphasisFrom = registerAstFrom<EmphasisExtension>()(
  'emphasis',
  (ctx, ast, text) => {
    const strongAction = ctx.editor.marks.emphasis
    return ctx.processIndicatorContent(strongAction, ast, text)
  }
)
