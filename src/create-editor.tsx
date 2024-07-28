import { createEditor } from 'prosekit/core'
import {
  defineExtension,
  defineAstFrom,
  defineAstTo,
  defineRemarkPlugins,
} from './extensions'
import { MarkdownProcessor } from './markdown'

export function createMarkdownEditor() {
  const extension = defineExtension()
  const astFrom = defineAstFrom()
  const astTo = defineAstTo()
  const remarkPlugins = defineRemarkPlugins()

  const editor = createEditor({ extension })
  const markdownProcessor = new MarkdownProcessor(editor, {
    astFrom,
    astTo,
    remarkPlugins,
  })

  return { editor, markdown: markdownProcessor }
}
