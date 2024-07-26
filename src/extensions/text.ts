import type { defineText } from 'prosekit/core'
import { registerAstFrom } from '../markdown/methods'

export { defineText } from 'prosekit/core'

export type TextExtension = ReturnType<typeof defineText>

export const astTextFrom = registerAstFrom<TextExtension>()('text', (ctx, ast) => {
  return ctx.createTextNode(ast.value)
})
