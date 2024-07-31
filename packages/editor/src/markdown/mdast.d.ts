/// <reference types="mdast-util-highlight-mark" />

import 'mdast'
declare module 'mdast' {
  type ParentContent =
    | Paragraph
    | Blockquote
    | Delete
    | Emphasis
    | FootnoteDefinition
    | Heading
    | Link
    | LinkReference
    | List
    | ListItem
    | Strong
    | Table
    | TableRow
    | TableCell

  type RootContentNames = keyof RootContentMap

  interface StringContent extends Literal {
    type: 'stringContent'
  }

  interface BlockContentMap {
    stringContent: StringContent
  }

  interface RootContentMap {
    stringContent: StringContent
  }

  interface PhrasingContentMap {
    stringContent: StringContent
  }

  interface TableRow {
    align?: Table['align']
    isHeader?: boolean
  }

  interface TableCell {
    align?: AlignType
    isHeader?: boolean
  }
}
