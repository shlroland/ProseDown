import type { Root, RootContent, RootContentMap, RootContentNames } from 'mdast'
import type { Editor } from 'prosekit/core'
import type { Mark, ProseMirrorNode } from 'prosekit/pm/model'
import type { PluggableList, Plugin, Preset } from 'unified'
import type { MarkdownProcessor } from '.'
export type { RootContent } from 'mdast'

export type RemarkPlugin =
  | { plugin: Plugin<unknown[]>; params?: unknown[] | [boolean] }
  | PluggableList
  | Preset

export type AstFromAction<
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  T extends RootContentNames = any,
  E extends Editor = Editor,
> = (
  ctx: MarkdownProcessor<E>,
  ast: RootContentMap[T],
  text: string,
  pos: number,
  marks: Mark[],
  parent?: RootContent | Root,
) => ProseMirrorNode | ProseMirrorNode[] | null | undefined

export type AstToAction<E extends Editor = Editor> = (
  ctx: MarkdownProcessor<E>,
  curNode: ProseMirrorNode,
  prevNode: RootContent | undefined,
) => RootContent | undefined | null
