import { createEditor } from 'prosekit/core'
import {
  defineAstFrom,
  defineAstTo,
  defineDecorationActions,
  defineExtension,
  defineIndicatorContent,
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
  const indicatorContent = defineIndicatorContent()

  const markdownSync = defineMarkdownSync(
    markdownProcessor,
    decorationActions,
    indicatorContent
  )

  editor.use(markdownSync)

  return { editor, markdown: markdownProcessor }
}
