import {
  type PluginSpec,
  type PluginView,
  type StateField,
  type Selection,
  type Plugin,
  PluginKey,
} from 'prosekit/pm/state'
import {
  type Decoration,
  DecorationSet,
  type EditorProps,
  type EditorView,
} from 'prosekit/pm/view'
import type { MarkdownProcessor } from '..'
import type { Editor } from 'prosekit/core'
import type { CachedMap, CreateDecorationsAction } from './types'
import type { ProseMirrorNode } from 'prosekit/pm/model'
import type { Nodes } from 'mdast'
import { extractBlockTextContent, isBasicContainerPM, isContenteditbaleFalse } from '../utils'
import { applyOffset, createDecorations } from './decorations'

interface MarkdownSyncState {
  decorations: DecorationSet
}

const MOUSEUP_META = 'mouseup'

const markdownSyncKey = new PluginKey<MarkdownSyncState>('markdownSyncKey')

export class MarkdownSyncSpec<E extends Editor>
  implements PluginSpec<MarkdownSyncState>
{
  key: PluginKey<MarkdownSyncState> = markdownSyncKey

  pluginState: MarkdownSyncState = { decorations: DecorationSet.empty }

  editorView: EditorView | null = null

  private editableFalse = false

  private shouldIgnore = false

  private processor: MarkdownProcessor<E>

  private decorationsActionMap: Map<string, CreateDecorationsAction>

  constructor(
    processor: MarkdownProcessor<E>,
    decorationsActions: [string, CreateDecorationsAction][],
  ) {
    this.processor = processor
    this.decorationsActionMap = new Map(decorationsActions)
  }

  state: StateField<MarkdownSyncState> = {
    init: (_, state) => {
      const decorations: Decoration[] = []
      const cachedMap: CachedMap = new Map()
      state.doc.descendants((node, pos) => {
        if (shouldContainerSync(node)) {
          decorations.push(...this.initDecorations(state.doc, pos, cachedMap))
          return false
        }
      })
      cachedMap.clear()
      this.pluginState.decorations = this.pluginState.decorations.add(
        state.doc,
        decorations,
      )

      return this.pluginState
    },

    apply: () => {
      return this.pluginState
    },
  }

  props: EditorProps<Plugin<MarkdownSyncState>> = {
    decorations: () => this.pluginState.decorations,
  }

  view: (view: EditorView) => PluginView = (view) => {
    this.editorView = view

    const handleMousedown = this.handleMousedown.bind(this)
    const handleMouseup = this.handleMouseup.bind(this)

    window.addEventListener('mousedown', handleMousedown, {
      capture: true,
    })
    window.addEventListener('mouseup', handleMouseup, {
      capture: true,
    })

    return {
      destroy: () => {
        window.removeEventListener('mousedown', handleMousedown, {
          capture: true,
        })
        window.removeEventListener('mouseup', handleMouseup, {
          capture: true,
        })
      },
    }
  }

  private handleMouseup() {
    this.shouldIgnore = false
    if (!this.editableFalse) {
      this.editorView?.dispatch(
        this.editorView?.state.tr
          .setMeta(MOUSEUP_META, true)
          .setMeta('addToHistory', false),
      )
    }
  }

  private handleMousedown(ev: MouseEvent) {
    this.shouldIgnore = true
    this.editableFalse = isContenteditbaleFalse(
      ev.target as HTMLElement,
      this.editorView!,
    )
  }

  initDecorations(
    doc: ProseMirrorNode,
    pos: number,
    cachedMap: CachedMap,
    selection?: Selection,
  ) {
    const curNode = doc.nodeAt(pos)
    if (!curNode || !shouldContainerSync(curNode)) return []
    const [ast] = this.parseTextAst(extractBlockTextContent(curNode), cachedMap)

    applyOffset(ast)

    return createDecorations(
      pos,
      ast,
      {
        selection,
        isInRange: false,
      },
      this.decorationsActionMap,
    )
  }

  private parseTextAst(
    text: string,
    cachedMap: CachedMap = new Map(),
  ): [Nodes, string] {
    let ast: Nodes | undefined = cachedMap.get(text)
    if (!ast) {
      ast = this.processor.processor.parse(text)
    }

    cachedMap.set(text, ast)

    return [ast, text]
  }
}

export function shouldContainerSync(node: ProseMirrorNode) {
  return isBasicContainerPM(node) && node.nodeSize <= 1e4
}
