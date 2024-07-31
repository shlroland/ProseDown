import type { Nodes, PhrasingContentMap, Root } from 'mdast'
import type { Editor } from 'prosekit/core'
import { Fragment, type Mark, type ProseMirrorNode } from 'prosekit/pm/model'
import {
  type Plugin,
  PluginKey,
  type PluginSpec,
  type PluginView,
  type Selection,
  type StateField,
  TextSelection,
  type Transaction,
} from 'prosekit/pm/state'
import {
  AddMarkStep,
  RemoveMarkStep,
  ReplaceAroundStep,
  ReplaceStep,
  Transform,
} from 'prosekit/pm/transform'
import {
  type Decoration,
  DecorationSet,
  type EditorProps,
  type EditorView,
} from 'prosekit/pm/view'
import { KEEPER_END, KEEPER_START } from 'remark-inline-keeper'
import { visit } from 'unist-util-visit'
import type { MarkdownProcessor } from '..'
import { fromPhrasingContent } from '../methods'
import {
  adjustPosition,
  extractBlockTextContent,
  isBasicContainerPM,
  isContenteditbaleFalse,
  isParentContent,
  shouldContainerSync,
} from '../utils'
import {
  applyOffset,
  clearCurrentDecorations,
  createDecorations,
} from './decorations'
import { MarkStepTree } from './mark-step-tree'
import { SelectionTracker } from './selection'
import type {
  CachedMap,
  CreateDecorationsAction,
  IndicatorAction,
  MarkdownSyncState,
  ReplaceResult,
  StatusCachedMap,
  StatusResult,
} from './types'

const MOUSEUP_META = 'mouseup'

const INLINE_DECO = 'inlineDecoration'

const markdownSyncKey = new PluginKey<MarkdownSyncState>('markdownSyncKey')

export class MarkdownSyncSpec<E extends Editor>
  implements PluginSpec<MarkdownSyncState>
{
  key: PluginKey<MarkdownSyncState> = markdownSyncKey

  pluginState: MarkdownSyncState = { decorations: DecorationSet.empty }

  editorView: EditorView | null = null

  statusResult: StatusResult | null = null

  frameTimer: number | null = null

  private editableFalse = false

  private shouldIgnore = false

  private processor: MarkdownProcessor<E>

  private decorationsActionMap: Map<string, CreateDecorationsAction>

  private indicatorMap: Map<keyof PhrasingContentMap, IndicatorAction>

  constructor(
    processor: MarkdownProcessor<E>,
    decorationsActions: [string, CreateDecorationsAction][],
    indicatorActions: [keyof PhrasingContentMap, IndicatorAction][]
  ) {
    this.processor = processor
    this.decorationsActionMap = new Map(decorationsActions)
    this.indicatorMap = new Map(indicatorActions)
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
        decorations
      )

      return this.pluginState
    },

    apply: (tr) => {
      if (tr.docChanged && this.statusResult) {
        const newReplaceResult: ReplaceResult = new Map()
        this.statusResult.replace.forEach((item, pos) => {
          newReplaceResult.set(tr.mapping.map(pos), item)
        })
      }

      this.pluginState.decorations = this.pluginState.decorations.map(
        tr.mapping,
        tr.doc
      )

      const dispatchMeta = tr.getMeta(INLINE_DECO)
      if (dispatchMeta) {
        this.pluginState.decorations = this.pluginState.decorations.add(
          tr.doc,
          dispatchMeta
        )
      }

      if (!this.shouldIgnore) {
        const curSelection = tr.selection
        const focused = this.editorView?.hasFocus()
        this.pluginState.decorations = clearCurrentDecorations(
          tr.doc,
          this.pluginState.decorations
        )
        const cachedMap: CachedMap = new Map()
        let fromNode: ProseMirrorNode | undefined = curSelection.$from.node()
        let toNode: ProseMirrorNode | undefined = curSelection.$to.node()
        if (!shouldContainerSync(fromNode)) fromNode = undefined
        if (!shouldContainerSync(toNode)) toNode = undefined

        const updateDecorations = (pos: number, node: ProseMirrorNode) => {
          const decorations = this.initDecorations(
            tr.doc,
            pos,
            cachedMap,
            focused ? curSelection : undefined
          )

          const outdatedDeocrations = this.pluginState.decorations.find(
            pos,
            pos + node.nodeSize
          )

          this.pluginState.decorations = this.pluginState.decorations
            .remove(outdatedDeocrations)
            .add(tr.doc, decorations)
        }

        if (fromNode) {
          const startPos = curSelection.$from.before()

          updateDecorations(startPos, fromNode)

          if (!curSelection.empty && toNode && !toNode.eq(fromNode)) {
            const endPos = curSelection.$to.before()
            updateDecorations(endPos, toNode)
          }
        }
      }

      const mutations = this.findContentMutation(tr)

      if (!mutations) return this.pluginState
      this.frameTimer && cancelAnimationFrame(this.frameTimer)
      this.statusResult = mutations
      this.frameTimer = requestAnimationFrame(() => {
        if (this.statusResult) {
          this.dispatchContentMutation(this.statusResult)
          this.statusResult = null
        }
      })
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
          .setMeta('addToHistory', false)
      )
    }
  }

  private handleMousedown(ev: MouseEvent) {
    this.shouldIgnore = true
    this.editableFalse = isContenteditbaleFalse(
      ev.target as HTMLElement,
      this.editorView!
    )
  }

  private initDecorations(
    doc: ProseMirrorNode,
    pos: number,
    cachedMap: CachedMap,
    selection?: Selection
  ) {
    const curNode = doc.nodeAt(pos)
    if (!curNode || !shouldContainerSync(curNode)) return []
    const [ast] = this.parseTextAst(extractBlockTextContent(curNode), cachedMap)

    if (!isParentContent(ast) || ast.children.length <= 0) return []

    applyOffset(ast)

    return createDecorations(
      pos,
      ast,
      {
        selection,
        isInRange: false,
      },
      this.decorationsActionMap
    )
  }

  private findContentMutation(tr: Transaction) {
    if (!tr.docChanged) return null
    const { doc, selection } = tr
    const statusCached: StatusCachedMap = new Map()
    const result: ReplaceResult = new Map()
    const selTracker = new SelectionTracker()

    const { from, to } = selection

    tr.steps.forEach((step) => {
      if (step instanceof ReplaceAroundStep) {
        const node = doc.nodeAt(step.from)
        if (!node) return
        if (shouldContainerSync(node)) {
          const [ast, nodes] = this.processStepNode(node, statusCached)
          const newNode = node.type.create(
            node.attrs,
            Fragment.fromArray(nodes)
          )
          if (newNode.content.eq(node.content)) {
            result.set(step.from, { ast })
          } else {
            result.set(step.from, { ast, newNode })
          }
        } else {
          if (node.type.isTextblock) {
            this.pluginState.decorations = this.pluginState.decorations.remove(
              this.pluginState.decorations.find(step.from, step.to)
            )
          }
        }
      } else if (
        step instanceof AddMarkStep ||
        step instanceof RemoveMarkStep
      ) {
        doc.nodesBetween(step.from, step.to - 1, (node, pos) => {
          if (!shouldContainerSync(node)) return
          const [mdText] = this.transformMarkStep(node, [step.mark], pos)
          const [ast, textNodes] = this.processStepNodeText(
            mdText,
            statusCached
          )
          const newNode = node.type.create(
            node.attrs,
            Fragment.fromArray(textNodes)
          )
          if (newNode.content.eq(node.content)) {
            result.set(pos, { ast })
          } else {
            result.set(pos, { ast, newNode })
          }

          return false
        })
      } else if (step instanceof ReplaceStep) {
        step.getMap().forEach((_oldStart, _oldEnd, newStart, newEnd) => {
          const end = Math.min(newEnd, doc.content.size)

          doc.nodesBetween(newStart, end, (node, pos) => {
            if (isBasicContainerPM(node) && node.childCount > 0) {
              if (!shouldContainerSync(node)) {
                result.set(pos, {})
                return
              }
            } else {
              if (node.type.isTextblock) {
                this.pluginState.decorations =
                  this.pluginState.decorations.remove(
                    this.pluginState.decorations.find(pos, pos + node.nodeSize)
                  )
              }
              return
            }

            const [ast, nodes] = this.processStepNode(node, statusCached)
            const newNode = node.type.create(
              node.attrs,
              Fragment.fromArray(nodes)
            )

            if (newNode.content.eq(node.content)) {
              result.set(pos, { ast })
            } else {
              result.set(pos, { ast, newNode })
              selTracker.append(from, to)
            }

            return false
          })
        })
      }
    })

    statusCached.clear()

    return result.size > 0
      ? {
          replace: result,
          resetCursorRanges: selTracker,
        }
      : null
  }

  private processStepNode(
    node: ProseMirrorNode,
    cachedMap: StatusCachedMap = new Map()
  ): [Nodes, ProseMirrorNode[]] {
    const text = extractBlockTextContent(node)
    return this.processStepNodeText(text, cachedMap)
  }

  private processStepNodeText(
    text: string,
    cachedMap: StatusCachedMap = new Map()
  ): [Nodes, ProseMirrorNode[]] {
    const cached = cachedMap.get(text)
    if (cached) {
      return [structuredClone(cached[0]), cached[1]]
    }

    const [ast, sText] = this.parseTextAst(text)
    const nodes = fromPhrasingContent(this.processor, ast as Root, sText, [])
    const result: [Nodes, ProseMirrorNode[]] = [structuredClone(ast), nodes]
    cachedMap.set(text, result)
    return result
  }

  private transformMarkStep(
    doc: ProseMirrorNode,
    marks: Mark[],
    pos: number
  ): [string, MarkStepTree, Transform] {
    const tr = new Transform(doc)
    this.pluginState.decorations
      .find(pos + 1, pos + 1 + tr.doc.content.size, (spec) => spec.isMark)
      .forEach((deco) => {
        const start = tr.mapping.map(deco.from - pos - 1)
        const end = tr.mapping.map(deco.to - pos - 1)
        tr.delete(start, end)
      })

    const markStepTree = new MarkStepTree(marks, tr, this.indicatorMap)
    debugger
    return [markStepTree.toMarkdown(), markStepTree, tr]
  }

  dispatchContentMutation(result: StatusResult) {
    const view = this.processor.editor.view
    const state = view.state
    const { tr, selection } = state
    const decorations: Decoration[] = []
    const cacheMap = new Map()

    result.replace.forEach(({ ast, newNode }, _pos) => {
      let pos = _pos
      const originalPosition = pos
      pos = tr.mapping.map(pos)
      const curNode = tr.doc.nodeAt(pos)
      if (curNode) {
        if (newNode) {
          let newFrom: number
          let newTo: number
          let newContent: Fragment | ProseMirrorNode
          if (curNode.hasMarkup(newNode.type, newNode.attrs, newNode.marks)) {
            newFrom = pos + 1
            newTo = newFrom + curNode.content.size
            newContent = newNode.content
          } else {
            newFrom = pos
            newTo = pos + curNode.nodeSize
            newContent = newNode
          }

          tr.replaceWith(newFrom, newTo, newContent)
        }

        if (ast) {
          this.pluginState.decorations = this.pluginState.decorations.remove(
            this.pluginState.decorations.find(
              originalPosition,
              originalPosition + curNode.nodeSize
            )
          )
          const decos = this.initDecorations(tr.doc, pos, cacheMap, selection)
          decorations.push(...decos)
        }
      }
    })

    if (result.resetCursorRanges) {
      if (!selection.empty) {
        const range = this.mapSelectionRange(view.state.doc, tr.doc)
        if (range) {
          const { start, end } = range
          result.resetCursorRanges.append(start, end)
        }
      }

      const resetRange = result.resetCursorRanges.get()
      if (resetRange) {
        try {
          const resolvedStart = tr.doc.resolve(resetRange.from)
          const resolvedEnd = tr.doc.resolve(resetRange.to)
          tr.setSelection(TextSelection.between(resolvedStart, resolvedEnd, 1))
        } catch (err) {
          console.error(err)
        }
      }
    }

    view.dispatch(tr.setMeta(INLINE_DECO, decorations))
    cacheMap.clear()
  }

  private mapSelectionRange(stateDoc: ProseMirrorNode, trDoc: ProseMirrorNode) {
    const startDiff = stateDoc.content.findDiffStart(trDoc.content)
    if (!startDiff) return null
    const endDiff = stateDoc.content.findDiffEnd(trDoc.content)
    if (!endDiff) return null

    let { a, b } = endDiff
    const offset = startDiff - Math.min(a, b)
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    offset > 0 && (b += offset)

    return {
      start: startDiff,
      end: b,
    }
  }

  private parseTextAst(
    text: string,
    cachedMap: CachedMap = new Map()
  ): [Nodes, string] {
    let dummyText = text
    if (text) {
      dummyText = `${KEEPER_START}${text}${KEEPER_END}`
    }

    let ast: Nodes | undefined = cachedMap.get(dummyText)
    if (!ast) {
      ast = this.processor.processor.parse(dummyText)
    }

    const offset = -1
    visit(ast, (node) => {
      adjustPosition(node, offset)
    })

    cachedMap.set(dummyText, ast)

    return [ast, text]
  }
}
