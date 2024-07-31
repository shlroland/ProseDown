import { type Editor, definePlugin } from 'prosekit/core'
import { Plugin } from 'prosekit/pm/state'
import type { MarkdownProcessor } from '..'
import { MarkdownSyncSpec } from './plugin'
import type { CreateDecorationsAction, IndicatorAction } from './types'
import type { PhrasingContentMap } from 'mdast'

export {
  createIndicatorDecorations,
  createMarkDecoration,
  calcNodePosition,
} from './decorations'
export type { CreateDecorationsAction } from './types'

export function defineMarkdownSync<E extends Editor>(
  processor: MarkdownProcessor<E>,
  decorationsActions: [string, CreateDecorationsAction][],
  indicatorActions: [keyof PhrasingContentMap, IndicatorAction][]
) {
  return definePlugin(
    new Plugin(
      new MarkdownSyncSpec(processor, decorationsActions, indicatorActions)
    )
  )
}
