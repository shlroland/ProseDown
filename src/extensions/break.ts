import { defineNodeSpec, type Extension } from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'
import { registerAstFrom } from '../markdown/methods'

function defineBreakSpec() {
  return defineNodeSpec({
    name: 'break',
    group: 'inline',
    marks: '_',
    atom: true,
    inline: true,
    isolating: true,
    selectable: false,
    attrs: {
      syntax: {
        default: `\\
`,
        validate: 'string',
      },
      isInline: {
        default: false,
        validate: 'boolean',
      },
    },
    parseDOM: [{ tag: 'br' }],
    toDOM: () => ['br'],
  })
}

type BreakExtension = Extension<{ Nodes: { break: Attrs } }>

export function defineBreak() {
  return defineBreakSpec()
}

export const astBreakFrom = registerAstFrom<BreakExtension>()(
  'break',
  (ctx) => {
    const breakAction = ctx.editor.nodes.break
    return breakAction()
  }
)
