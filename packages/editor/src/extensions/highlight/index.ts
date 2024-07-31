import { type Extension, defineMarkSpec } from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'
import { remarkHighlightMark } from 'remark-highlight-mark'
import {
  registerAstFrom,
  registerDecorationsAction,
  registerIndicatorContent,
  registerRemarkPlugin,
} from '../../markdown/methods'
import { createIndicatorDecorations } from '../../markdown/sync'
import type { RemarkPlugin } from '../../markdown/types'

export function defineHighlight() {
  return defineMarkSpec({
    name: 'highlight',
    inclusive: false,
    parseDOM: [{ tag: 'mark' }],
    toDOM: () => {
      return ['mark', 0]
    },
  })
}

type HighlightExtension = Extension<{
  Marks: {
    highlight: Attrs
  }
}>

export const highlightRemark = registerRemarkPlugin(
  'highlight',
  remarkHighlightMark as RemarkPlugin
)

export const astHighlightFrom = registerAstFrom<HighlightExtension>()(
  'highlight',
  (ctx, ast, text) => {
    const highlightAction = ctx.editor.marks.highlight

    return ctx.fromIndicatorContent(highlightAction, ast, text)
  }
)

export const decorationHighlight = registerDecorationsAction(
  'highlight',
  (pos, node, info, actionMap) =>
    createIndicatorDecorations(pos, node, info, actionMap)
)

export const highlightIndicator = registerIndicatorContent('highlight', () => [
  '==',
  '==',
])
