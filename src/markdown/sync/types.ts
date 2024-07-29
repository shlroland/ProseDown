import type { Nodes, RootContentMap, RootContentNames } from 'mdast'
import type { Decoration } from 'prosekit/pm/view'
import type { Selection } from 'prosekit/pm/state'

export type CachedMap = Map<string, Nodes>

export interface DecorationInfo {
  isInRange: boolean
  selection?: Selection
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type CreateDecorationsAction<T extends RootContentNames = any> = (
  pos: number,
  node: RootContentMap[T],
  info: DecorationInfo,
  actionMap: Map<string, CreateDecorationsAction>,
) => Decoration[]

export interface DecorationSpec {
  isMark: boolean
  reset?: (deco: Decoration, inRange: boolean) => Decoration
  inRange?: boolean
}
