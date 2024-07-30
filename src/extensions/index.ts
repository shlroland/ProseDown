import { defineBasicExtension } from 'prosekit/basic'
import { defineHistory, union } from 'prosekit/core'
import { defineBlockquote } from 'prosekit/extensions/blockquote'
import { astBlockquoteFrom, astBlockquoteTo } from './blockquote'
import { astBreakFrom, decorationBreak, defineBreak } from './break'
import { astCodeFrom, astCodeTo, defineCode } from './code'
import { defineDoc } from './doc'
import { astEmphasisFrom, decorationEmphasis, defineEmphasis } from './emphasis'
import { astHeadingFrom, astHeadingTo, defineHeading } from './heading'
import {
  astHighlightFrom,
  decorationHighlight,
  defineHighlight,
  highlightRemark,
} from './highlight'
import {
  astInlineCodeFrom,
  decorationInlineCode,
  defineInlineCode,
} from './inline-code'
import { astLinkFrom, decorationLink, defineLink } from './link'
import {
  astBulletListTo,
  astListFrom,
  astOrderedListTo,
  defineList,
} from './list'
import { astListItemFrom, astListItemTo, defineListItem } from './list-item'
import {
  astParagraphFrom,
  astParagraphTo,
  defineParagraph,
  stringToMarkdownPlugin,
} from './paragraph'
import { astStrongFrom, decorationStrong, defineStrong } from './strong'
import { astTextFrom, defineText } from './text'
import {
  astThematicBreakFrom,
  astThematicBreakTo,
  defineThematicBreak,
} from './thematic-break'

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
    defineHighlight(),
    defineHistory(),
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
    astHighlightFrom(),
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
    astThematicBreakTo(),
  ]
}

export function defineRemarkPlugins() {
  return [stringToMarkdownPlugin(), highlightRemark()]
}

export function defineDecorationActions() {
  return [
    decorationBreak(),
    decorationEmphasis(),
    decorationInlineCode(),
    decorationLink(),
    decorationStrong(),
    decorationHighlight(),
  ]
}
