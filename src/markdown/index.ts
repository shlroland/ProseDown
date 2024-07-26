import { type Data, type Processor, unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import type { AstFromAction, AstToAction, RemarkPlugin } from './types'
import { isArray, isFunction } from 'remeda'
import type {
  ParentContent,
  PhrasingContent,
  Root,
  RootContent,
} from 'mdast'
import type { DocExtension, Editor, MarkAction } from 'prosekit/core'
import type { Mark, ProseMirrorNode } from 'prosekit/pm/model'
import { isBasicContainer, isParentContent } from './utils'
import type { ExtractFirst } from '../utils/type'

export class MarkdownProcessor<
  E extends Editor,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  AstF extends readonly [any, AstFromAction<any>][] = any
> {
  remarkPlugins: Map<string | symbol, RemarkPlugin>

  astFrom: Map<ExtractFirst<AstF>, AstFromAction<ExtractFirst<AstF>>>

  astTo: Map<string, AstToAction<Editor>>

  editor: E

  #processor: Processor<Root, undefined, undefined, Root, string>

  #data?: Data | ((data: Data) => Data)

  constructor(
    editor: E,
    options: {
      remarkPlugins?: [string | symbol, RemarkPlugin][]
      data?: Data | ((data: Data) => Data)

      astFrom?: AstF
      astTo?: [string, AstToAction<Editor>][]
    }
  ) {
    this.editor = editor
    this.remarkPlugins = new Map(options.remarkPlugins ?? [])
    this.#data = options.data
    this.#processor = this.createProcessor(this.remarkPlugins.values(), this.#data)
    this.astFrom = new Map(options.astFrom ?? [])
    this.astTo = new Map(options.astTo ?? [])
  }

  get processor() {
    return this.#processor
  }

  get data() {
    return this.#processor.data()
  }

  parseMarkdownText(text: string) {
    const root = this.processor.parse(text)
    return this.processRoot(root, text)
  }

  processRoot(root: Root, text: string) {
    return (this.editor as Editor<DocExtension>).nodes.doc(
      this.processParentContent(root, text)
    )
  }

  processParentContent(content: ParentContent | Root, text: string) {
    return this.processChildrenContent(content.children, text, content)
  }

  processChildrenContent(
    content: RootContent[],
    text: string,
    parent: RootContent | Root
  ) {
    const result: ProseMirrorNode[] = []
    content.forEach((child, index) => {
      const astFromAction = this.astFrom.get(child.type)
      if (astFromAction) {
        const childNodes = astFromAction(this, child, text, index, [], parent)
        if (!childNodes) return
        isArray(childNodes) ? result.push(...childNodes) : result.push(childNodes)
      }
    })

    return result
  }

  processPhrasingContent(content: ParentContent, text: string, marks: Mark[]) {
    const result: ProseMirrorNode[] = []
    content.children.forEach((child, index) => {
      if (isBasicContainer(child)) {
        result.push(...this.processPhrasingContent(child, text, marks))
        return
      }

      const astFromAction = this.astFrom.get(child.type)
      if (astFromAction) {
        const childNodes = astFromAction(this, child, text, index, marks, content)
        if (!childNodes) return
        isArray(childNodes) ? result.push(...childNodes) : result.push(childNodes)
        return
      }
    })

    return result
  }

  processIndicatorContent(
    markAction: MarkAction,
    content: PhrasingContent,
    text: string
    // index: number,
    // marks: Mark[]
  ) {
    const contentStart = content.position!.start.offset!
    const contentEnd = content.position!.end.offset!
    if (!isParentContent(content)) {
      const contentText = text.slice(contentStart, contentStart)
      return [this.createTextNode(contentText)]
    }

    const firstChild = content.children[0]
    const lastChild = content.children.at(-1) ?? firstChild

    const firstChildStart = firstChild.position!.start.offset!
    const lastChildEnd = lastChild.position!.end.offset!

    const firstIndicator = text.slice(
      contentStart,
      contentStart + (firstChildStart - contentStart)
    )
    const lastIndicator = text.slice(
      lastChildEnd,
      lastChildEnd + (contentEnd - lastChildEnd)
    )

    return markAction(
      ...[
        firstIndicator,
        ...this.processPhrasingContent(content, text, []),
        lastIndicator,
      ]
    )
  }

  createTextNode(text: string) {
    return this.editor.schema.text(text)
  }

  setProcessorData(data: Data | ((data: Data) => Data)) {
    this.#data = data
  }

  private createBasicProcessor() {
    return unified().use(remarkParse).use(remarkStringify)
  }

  private createProcessor(
    plugins?: Iterable<RemarkPlugin>,
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
