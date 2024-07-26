import type { Node, Paragraph, ParentContent } from 'mdast'

const basicContainers = ['paragraph']

export const isBasicContainer = (node: Node): node is Paragraph => {
  return basicContainers.includes(node.type)
}

export const isParentContent = (node: Node): node is ParentContent => {
  return 'children' in node
}
