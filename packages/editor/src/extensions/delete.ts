import { type Extension, defineMarkSpec } from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'
import { registerAstFrom, registerDecorationsAction } from '../markdown/methods'
import { createIndicatorDecorations } from '../markdown/sync'

export function defineDelete() {
  return defineMarkSpec({
    name: 'delete',
    inclusive: false,
    parseDOM: [
      { tag: 'del' },
      {
        style: 'text-decoration',
        getAttrs: (value) => (value === 'line-through') as false,
      },
    ],
    toDOM: () => {
      return ['del', 0]
    },
  })
}

type DeleteExtension = Extension<{
  Marks: {
    delete: Attrs
  }
}>

export const astDeleteFrom = registerAstFrom<DeleteExtension>()(
  'delete',
  (ctx, ast, text) => {
    const deleteAction = ctx.editor.marks.delete

    return ctx.fromIndicatorContent(deleteAction, ast, text)
  },
)

export const decorationDelete = registerDecorationsAction(
  'delete',
  (pos, node, info, actionMap) =>
    createIndicatorDecorations(pos, node, info, actionMap),
)
