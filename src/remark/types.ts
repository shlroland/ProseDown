import type { PluggableList, Plugin, Preset } from 'unified'
import type { RootContent, RootContentMap } from 'mdast'
import type { Editor, Extension, ExtensionTyping } from 'prosekit/core'
import type { Mark, ProseMirrorNode } from 'prosekit/pm/model'
export type { RootContent } from 'mdast'

export type RemarkPlugin =
  | { plugin: Plugin<unknown[]>; params?: unknown[] | [boolean] }
  | PluggableList
  | Preset

export type RootContentNames = keyof RootContentMap

export type AstFromAction<T extends RootContentNames> = (
  ast: RootContentMap[T],
  pos: number,
  marks: Readonly<Mark[]>,
  parent: RootContent
) => ProseMirrorNode | ProseMirrorNode[]
