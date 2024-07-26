import { defineNodeSpec, type Extension } from 'prosekit/core'
import { registerAstFrom } from '../markdown/methods'
import type { Attrs } from 'prosekit/pm/model'

export function defineText() {
  return defineNodeSpec({
    name: 'text',
    group: 'inline',
  })
}

export type TextExtension = Extension<{
  Nodes: {
    text: Attrs
  }
}>

export const astTextFrom = registerAstFrom<TextExtension>()('text', (ctx, ast) => {
  return ctx.createTextNode(ast.value)
})
