import { createEditor } from 'prosekit/core'
import {
  defineAstFrom,
  defineAstTo,
  defineDecorationActions,
  defineExtension,
  defineRemarkPlugins,
} from './extensions'
import { MarkdownProcessor } from './markdown'
import { defineMarkdownSync } from './markdown/sync'

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

  const decorationActions = defineDecorationActions()

  const markdownSync = defineMarkdownSync(markdownProcessor, decorationActions)

  editor.use(markdownSync)

  return { editor, markdown: markdownProcessor }
}
