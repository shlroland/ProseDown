import type { Nodes, RootContentMap, RootContentNames } from 'mdast'
import type { Mark, ProseMirrorNode } from 'prosekit/pm/model'
import type { Selection } from 'prosekit/pm/state'
import type { Decoration, DecorationSet } from 'prosekit/pm/view'
import type { SelectionTracker } from './selection'

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
  actionMap: Map<string, CreateDecorationsAction>
) => Decoration[]

export interface DecorationSpec {
  isMark: boolean
  reset?: (deco: Decoration, inRange: boolean) => Decoration
  inRange?: boolean
}

export type ReplaceResult = Map<
  number,
  { ast?: Nodes; newNode?: ProseMirrorNode }
>

export interface StatusResult {
  replace: ReplaceResult
  resetCursorRanges: SelectionTracker
}

export interface MarkdownSyncState {
  decorations: DecorationSet
}

export type StatusCachedMap = Map<string, [Nodes, ProseMirrorNode[]]>

export type IndicatorMarkAction = (mark: Mark) => [string, string]
export type IndicatorNodeAction = (node: Node) => string
export type IndicatorAction = IndicatorMarkAction | IndicatorNodeAction
