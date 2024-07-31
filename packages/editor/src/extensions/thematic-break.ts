import { type Extension, defineNodeSpec } from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'
import { registerAstFrom, registerAstTo } from '../markdown/methods'

export function defineThematicBreakSpec() {
  return defineNodeSpec({
    name: 'thematicBreak',
    group: 'block',
    marks: '',
    parseDOM: [{ tag: 'hr' }],
    toDOM: () => ['hr'],
  })
}

type ThematicBreakExtension = Extension<{
  Nodes: { thematicBreak: Attrs }
}>

export function defineThematicBreak() {
  return defineThematicBreakSpec()
}

export const astThematicBreakFrom = registerAstFrom<ThematicBreakExtension>()(
  'thematicBreak',
  (ctx) => {
    return ctx.editor.nodes.thematicBreak()
  },
)

export const astThematicBreakTo = registerAstTo('thematicBreak', () => ({
  type: 'thematicBreak',
}))
