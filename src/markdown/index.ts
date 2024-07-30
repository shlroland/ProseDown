import curry from 'just-curry-it'
import type { Root } from 'mdast'
import type { Editor } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { type Processor, unified } from 'unified'
import type { ExtractFirst } from '../utils/type'
import {
  createTextNode,
  fromChildrenContent,
  fromIndicatorContent,
  fromParentContent,
  fromPhrasingContent,
  fromRoot,
  toMarkdownAst,
} from './methods'
import type { AstFromAction, AstToAction, RemarkPlugin } from './types'

export class MarkdownProcessor<
  E extends Editor,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  AstF extends readonly [any, AstFromAction<any>][] = any,
> {
  remarkPlugins: Map<string | symbol, RemarkPlugin>

  astFrom: Map<ExtractFirst<AstF>, AstFromAction<ExtractFirst<AstF>>>

  astTo: Map<string, AstToAction<Editor>>

  editor: E

  #processor: Processor<Root, undefined, undefined, Root, string>

  constructor(
    editor: E,
    options: {
      remarkPlugins?: [string | symbol, RemarkPlugin][]

      astFrom?: AstF
      astTo?: [string, AstToAction<Editor>][]
    },
  ) {
    this.editor = editor
    this.remarkPlugins = new Map(options.remarkPlugins ?? [])
    this.#processor = this.createProcessor(this.remarkPlugins.values())
    this.astFrom = new Map(options.astFrom ?? [])
    this.astTo = new Map(options.astTo ?? [])
  }

  get processor() {
    return this.#processor
  }

  get data() {
    return this.#processor.data()
  }

  toCurrentDocMarkdown() {
    return this.toMarkdownText(this.editor.state.doc)
  }

  fromMarkdownText(text: string) {
    const root = this.processor.parse(text)
    return this.fromRoot(root, text)
  }

  toMarkdownText(doc: ProseMirrorNode) {
    if (doc.type.name !== 'doc') {
      throw Error('should pass `doc` node')
    }
    const root: Root = { type: 'root', children: this.toMarkdownAst(doc) }
    return this.#processor.stringify(root)
  }

  toMarkdownAst = curry(toMarkdownAst)(this)

  fromRoot = curry(fromRoot)(this)

  fromParentContent = curry(fromParentContent)(this)

  fromChildrenContent = curry(fromChildrenContent)(this)

  fromPhrasingContent = curry(fromPhrasingContent)(this)

  fromIndicatorContent = curry(fromIndicatorContent)(this)

  createTextNode = curry(createTextNode)(this)

  private createBasicProcessor() {
    return unified().use(remarkParse).use(remarkStringify)
  }

  private createProcessor(plugins?: Iterable<RemarkPlugin>) {
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

    return processor.freeze()
  }
}
