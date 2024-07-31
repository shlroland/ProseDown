import type { PhrasingContentMap } from 'mdast'
import type { Mark, ProseMirrorNode } from 'prosekit/pm/model'
import type { Transform } from 'prosekit/pm/transform'
import type { IndicatorAction } from './types'

interface MarkStepNode$Leaf {
  type: 'leaf'
  marks: Mark[]
  node: ProseMirrorNode
}
interface MarkStepNode$Parent {
  type: 'parent'
  mark: Mark
  children: (MarkStepNode$Leaf | MarkStepNode$Parent)[]
}

type MarkStepNode = MarkStepNode$Parent | MarkStepNode$Leaf

export class MarkStepTree {
  tree: MarkStepNode[]
  changedMarks: Mark[]
  private indicatorMap: Map<keyof PhrasingContentMap, IndicatorAction>

  constructor(
    marks: Mark[],
    tr: Transform,
    indicatorMap: Map<keyof PhrasingContentMap, IndicatorAction>
  ) {
    this.changedMarks = marks
    this.indicatorMap = indicatorMap
    const doc = tr.doc
    const nodes: MarkStepNode[] = []

    doc.forEach((node) => {
      const marksC = node.marks.slice(0)

      nodes.push({
        node,
        marks: marksC,
        type: 'leaf',
      })
    })

    this.tree = this.loop(nodes)
  }

  toMarkdownChildren(children: MarkStepNode[]) {
    let markdown = ''

    children.forEach((child) => {
      if (child.type === 'parent') {
        const [start, end] =
          child.mark.type.name === 'bold' ? ['**', '**'] : ['`', '`']

        markdown += start
        markdown += this.toMarkdownChildren(child.children)
        markdown += end
      } else {
        markdown += child.node.text
      }
    })

    return markdown
  }

  toMarkdown() {
    return this.toMarkdownChildren(this.tree)
  }

  private findNextSameMark(
    currentNode: MarkStepNode,
    nodes: MarkStepNode[],
    startIndex: number,
    targetMark: Mark
  ) {
    for (let i = startIndex; i < nodes.length; i++) {
      const node: MarkStepNode = nodes[i]
      if (node && 'node' in node) {
        if (node.marks.find((mark) => mark.eq(targetMark))) return true

        if ('node' in currentNode && node.node.sameMarkup(currentNode.node))
          continue
      }
      return false
    }
    return false
  }

  private findMarkGroup(
    nodes: MarkStepNode$Leaf[],
    startIndex: number,
    targetMark: Mark
  ): MarkStepNode$Leaf[] {
    const markGroup: MarkStepNode$Leaf[] = []

    for (let i = startIndex; i < nodes.length; i++) {
      const node = nodes[i]
      let isInGroup = false
      if (node.marks.find((mark) => mark.eq(targetMark))) {
        isInGroup = true
      } else if (
        node.marks.find((mark) => mark.type.excludes(targetMark.type))
      ) {
        isInGroup = this.findNextSameMark(node, nodes, i + 1, targetMark)
      }

      if (isInGroup) {
        markGroup.push({
          type: 'leaf',
          node: node.node,
          marks: node.marks.filter((mark) => !mark.eq(targetMark)),
        })
        continue
      }
      break
    }

    return markGroup
  }

  private loop(nodes: MarkStepNode[]) {
    let index = 0
    const resultTree: MarkStepNode[] = []
    while (index < nodes.length) {
      const node = nodes[index]
      if ('node' in node) {
        if (node.node.type.name !== 'text' || !node.node.text?.trim()) {
          index++
          resultTree.push({
            node: node.node,
            marks: [],
            type: 'leaf',
          })
          continue
        }

        const parentNode = node.marks
          .map((mark) => ({
            type: 'parent',
            mark,
            children: this.findMarkGroup(
              nodes as MarkStepNode$Leaf[],
              index,
              mark
            ),
          }))

          .sort(
            (a, b) => b.children.length - a.children.length
          )[0] as MarkStepNode$Parent

        if (parentNode) {
          index += parentNode.children.length
          resultTree.push(parentNode)
          parentNode.children = this.loop(parentNode.children)
        } else {
          index++
          resultTree.push({
            node: node.node,
            marks: [],
            type: 'leaf',
          })
        }
      }
    }

    return resultTree
  }
}
