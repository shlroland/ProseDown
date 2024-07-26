import { createEditor } from 'prosekit/core'
import { defineExtension, defineAstFrom } from './extensions'
import { MarkdownProcessor } from './markdown'

export function createMarkdownEditor() {
  const extension = defineExtension()
  const astFrom = defineAstFrom() 

  const editor = createEditor({ extension })
  const markdownProcessor = new MarkdownProcessor(editor, { astFrom })

  return { editor, markdown: markdownProcessor }
}
