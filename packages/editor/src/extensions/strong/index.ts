import {
  type Extension,
  defineCommands,
  defineKeymap,
  defineMarkSpec,
  toggleMark,
  union,
} from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'
import {
  registerAstFrom,
  registerDecorationsAction,
} from '../../markdown/methods'
import { createIndicatorDecorations } from '../../markdown/sync'
import { isString } from '../../utils/is'

export function defineStrong() {
  return union([
    defineStrongSpec(),
    defineStrongCommands(),
    defineStrongKeymap(),
  ])
}

export function defineStrongSpec() {
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

export function defineStrongCommands() {
  return defineCommands({
    toggleBold: () => toggleMark({ type: 'strong' }),
  })
}

export function defineStrongKeymap() {
  return defineKeymap({
    'Mod-b': toggleMark({ type: 'strong' }),
  })
}

type StrongExtension = Extension<{
  Marks: {
    strong: Attrs
  }
  Commands: {
    toggleStrong: []
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
