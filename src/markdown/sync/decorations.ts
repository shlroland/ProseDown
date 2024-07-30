import type { Nodes } from 'mdast'
import type { ProseMirrorNode } from 'prosekit/pm/model'
import { Decoration, type DecorationSet } from 'prosekit/pm/view'
import { visit } from 'unist-util-visit'
import {
  BooleanT,
  adjustPosition,
  isBasicContainerAst,
  isInSelectionRange,
  isParentContent,
} from '../utils'
import type {
  CreateDecorationsAction,
  DecorationInfo,
  DecorationSpec,
} from './types'

export function applyOffset(ast: Nodes) {
  let offset = 0
  visit(ast, (node) => {
    adjustPosition(node, offset)

    if (node.type === 'text') {
      const positionOffset =
        node.position!.end.offset! - node.position!.start.offset!
      const textLength = node.value.length

      if (positionOffset > textLength) {
        offset -= positionOffset - (textLength === 1 ? 0 : textLength)
      }
    }
  })
}

export function calcNodePosition(pos: number, node: Nodes, offset = 0) {
  const base = pos + 1
  const left = base + node.position!.start.offset!
  const right = base + node.position!.end.offset!
  return [left + offset, right + offset]
}

export function createDecorations(
  pos: number,
  root: Nodes,
  info: DecorationInfo,
  actionMap: Map<string, CreateDecorationsAction>,
) {
  const result: Decoration[] = []

  if (root.type === 'root') {
    visit(root, (node) => {
      if (isBasicContainerAst(node)) {
        processNode(node)
        return 'skip'
      }
      return true
    })
  } else {
    processNode(root)
  }

  return result

  function processNode(node: Nodes) {
    if (!isParentContent(node)) return
    node.children.forEach((child) => {
      const createDecoAction = actionMap.get(child.type)
      if (createDecoAction) {
        let isInRange = info.isInRange
        const [start, end] = calcNodePosition(pos, child)
        if (!isInRange && info?.selection) {
          isInRange = isInSelectionRange(info.selection, start, end)
        }
        const decorations = createDecoAction(
          pos,
          child,
          {
            selection: info?.selection,
            isInRange,
          },
          actionMap,
        )
        result.push(...decorations)
      }
    })
  }
}

export function createMarkDecoration(
  from: number,
  to: number,
  inRange: boolean,
) {
  return Decoration.inline(
    from,
    to,
    {
      class: inRange ? 'mark show' : 'mark',
    },
    {
      isMark: true,
      reset: (deco: Decoration, inRange: boolean) =>
        createMarkDecoration(deco.from, deco.to, inRange),
      inRange,
    } as DecorationSpec,
  )
}

export function createIndicatorDecorations(
  pos: number,
  node: Nodes,
  info: DecorationInfo,
  actionMap: Map<string, CreateDecorationsAction>,
) {
  const [nodeStartPos, nodeEndPos] = calcNodePosition(pos, node)
  const firstChild = 'children' in node && node.children[0]
  if (!firstChild) return []
  const lastChild = node.children.at(-1)!

  const [childStartPos] = calcNodePosition(pos, firstChild)
  const [, childEndPos] = calcNodePosition(pos, lastChild)

  return [
    createMarkDecoration(
      nodeStartPos,
      nodeStartPos + (childStartPos - nodeStartPos),
      info.isInRange,
    ),
    ...createDecorations(pos, node, info, actionMap),
    createMarkDecoration(
      childEndPos,
      childEndPos + (nodeEndPos - childEndPos),
      info.isInRange,
    ),
  ]
}

export function clearCurrentDecorations(
  doc: ProseMirrorNode,
  decoSet: DecorationSet,
) {
  const inRangeDecorations = decoSet.find(
    undefined,
    undefined,
    (decoSpec: DecorationSpec) => !!(decoSpec.reset && decoSpec.inRange),
  )
  const resetDecorations = inRangeDecorations
    .map((deco) => deco.spec.reset(deco, false))
    .filter(BooleanT())

  return decoSet.remove(inRangeDecorations).add(doc, resetDecorations)
}
