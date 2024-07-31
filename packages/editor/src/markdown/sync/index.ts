import { type Editor, definePlugin } from 'prosekit/core'
import { Plugin } from 'prosekit/pm/state'
import type { MarkdownProcessor } from '..'
import { MarkdownSyncSpec } from './plugin'
import type { CreateDecorationsAction } from './types'

export {
  createIndicatorDecorations,
  createMarkDecoration,
  calcNodePosition,
} from './decorations'
export type { CreateDecorationsAction } from './types'

export function defineMarkdownSync<E extends Editor>(
  processor: MarkdownProcessor<E>,
  decorationsActions: [string, CreateDecorationsAction][],
) {
  return definePlugin(
    new Plugin(new MarkdownSyncSpec(processor, decorationsActions)),
  )
}
