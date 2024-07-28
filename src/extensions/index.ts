import { defineBasicExtension } from 'prosekit/basic'
import { defineDoc } from './doc'
import { astTextFrom, defineText } from './text'
import { astStrongFrom, defineStrong } from './strong'
import { astInlineCodeFrom, defineInlineCode } from './inline-code'
import { astParagraphFrom, defineParagraph } from './paragraph'
import { union } from 'prosekit/core'
import { astEmphasisFrom, defineEmphasis } from './emphasis'
import { astHeadingFrom, defineHeading } from './heading'
import { defineBlockquote } from 'prosekit/extensions/blockquote'
import { astBlockquoteFrom } from './blockquote'
import { astLinkFrom, defineLink } from './link'
import { astListFrom, defineList } from './list'
import { astListItemFrom, defineListItem } from './list-item'
import { astCodeFrom, defineCode } from './code'
import { AstBreakFrom, defineBreak } from './break'

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
    defineHeading(),
    defineBlockquote(),
    defineLink(),
    defineList(),
    defineListItem(),
    defineCode(),
    defineBreak(),
  ])
}

export function defineAstFrom() {
  return [
    astParagraphFrom(),
    astTextFrom(),
    astStrongFrom(),
    astInlineCodeFrom(),
    astEmphasisFrom(),
    astHeadingFrom(),
    astBlockquoteFrom(),
    astLinkFrom(),
    astListFrom(),
    astListItemFrom(),
    astCodeFrom(),
    AstBreakFrom(),
  ] as const
}
