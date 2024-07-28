import { defineBasicExtension } from 'prosekit/basic'
import { defineDoc } from './doc'
import { astTextFrom, defineText } from './text'
import { astStrongFrom, defineStrong } from './strong'
import { astInlineCodeFrom, defineInlineCode } from './inline-code'
import {
  astParagraphFrom,
  astParagraphTo,
  defineParagraph,
  stringToMarkdownPlugin,
} from './paragraph'
import { union } from 'prosekit/core'
import { astEmphasisFrom, defineEmphasis } from './emphasis'
import { astHeadingFrom, astHeadingTo, defineHeading } from './heading'
import { defineBlockquote } from 'prosekit/extensions/blockquote'
import { astBlockquoteFrom, astBlockquoteTo } from './blockquote'
import { astLinkFrom, defineLink } from './link'
import { astBulletListTo, astListFrom, astOrderedListTo, defineList } from './list'
import { astListItemFrom, astListItemTo, defineListItem } from './list-item'
import { astCodeFrom, astCodeTo, defineCode } from './code'
import { astBreakFrom, defineBreak } from './break'
import { astThematicBreakFrom, astThematicBreakTo, defineThematicBreak } from './thematic-break'

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
    defineThematicBreak(),
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
    astBreakFrom(),
    astThematicBreakFrom(),
  ] as const
}

export function defineAstTo() {
  return [
    astParagraphTo(),
    astHeadingTo(),
    astBlockquoteTo(),
    astCodeTo(),
    astBulletListTo(),
    astOrderedListTo(),
    astListItemTo(),
    astThematicBreakTo()
  ]
}

export function defineRemarkPlugins() {
  return [stringToMarkdownPlugin]
}
