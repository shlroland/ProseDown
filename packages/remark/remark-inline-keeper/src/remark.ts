import type { Plugin } from 'unified'
import { add } from 'unist-util-add'
import { inlineKeeper as inlineKeeperExtension } from './micromark'

export const inlineKeeper: Plugin = function inlineKeeper() {
  const data = this.data()
  add(data, 'micromarkExtensions', inlineKeeperExtension())
}
