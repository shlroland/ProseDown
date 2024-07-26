import { defineBasicExtension } from 'prosekit/basic'
import { defineDoc } from './doc'
import { astTextFrom, defineText } from './text'
import { astStrongFrom, defineStrong } from './strong'
import { astInlineCodeFrom, defineInlineCode } from './inline-code'
import { astParagraphFrom, defineParagraph } from './paragraph'
import { type Editor, union } from 'prosekit/core'
import { astEmphasisFrom, defineEmphasis } from './emphasis'
import type { RootContentNames } from 'mdast'
import type { AstFromAction } from '../markdown/types'

export function defineBasicDemoExtension() {
  return defineBasicExtension()
}

export type EditorExtension = ReturnType<typeof defineBasicDemoExtension>

export function defineExtension() {
  return union([
    defineDoc(),
    defineText(),
    defineStrong(),
    defineInlineCode(),
    defineParagraph(),
    defineEmphasis(),
  ])
}

export function defineAstFrom() {
  return [
    astParagraphFrom(),
    astTextFrom(),
    astStrongFrom(),
    astInlineCodeFrom(),
    astEmphasisFrom(),
  ] as const
}
