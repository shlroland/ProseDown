import { type Data, type Processor, unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import type { RemarkPlugin } from './types'
import { isFunction } from 'remeda'
import type { Root } from 'mdast'

export class Remark {
  processor: Processor<Root, undefined, undefined, Root, string>

  constructor() {

  }

  private createBasicProcessor() {
    return unified.use(remarkParse).use(remarkStringify)
  }

  private createProcessor(
    plugins?: RemarkPlugin[],
    data?: Data | ((data: Data) => Data)
  ) {
    const processor = this.createBasicProcessor()
    if (plugins) {
      for (const plugin of plugins) {
        if (Array.isArray(plugin)) {
          processor.use(plugin)
        } else if ('plugin' in plugin) {
          processor.use(plugin.plugin, ...(plugin.params ?? []))
        } else {
          processor.use(plugin)
        }
      }
    }

    if (data) {
      let _data = processor.data()
      if (isFunction(data)) {
        _data = data(_data)
      } else {
        _data = data
      }
      processor.data(_data)
    }

    return processor.freeze()
  }
}
