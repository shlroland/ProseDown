import type {
  Blockquote,
  Delete,
  Emphasis,
  FootnoteDefinition,
  Heading,
  Link,
  LinkReference,
  List,
  ListItem,
  Paragraph,
  Root,
  RootContent,
  RootContentMap,
  Strong,
  Table,
  TableCell,
  TableRow,
} from 'mdast'

declare module 'mdast' {
  export type ParentContent =
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

  export type RootContentNames = keyof RootContentMap
}
