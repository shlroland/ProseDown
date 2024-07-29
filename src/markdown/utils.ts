import type { Node, Paragraph, ParentContent, RootContent } from 'mdast'
import type { ProseMirrorNode } from 'prosekit/pm/model'
import { isArray } from '../utils/is'

export const basicContainers = ['paragraph']

export const isBasicContainer = (node: Node): node is Paragraph => {
  return basicContainers.includes(node.type)
}

export const isParentContent = (node: Node): node is ParentContent => {
  return 'children' in node
}

const toHexCharCode = (t: string) => `&#x${t.charCodeAt(0).toString(16)};`
const hexForwardSlash = '&#x2f;'
const hexLeftSquareBracket = '&#x5b;'
const hexGraveAccent = '&#x60;'

export function sanitizerText(t: string) {
  return t
    .replace(/^ /gm, '&#x20;')
    .replace(/ $/gm, '&#x20;')
    .replace(/^([>#])/gm, (_, $1) => toHexCharCode($1))
    .replace(/^([*+-])(\\s)/gm, (_, $1, $2) => `${toHexCharCode($1)}${$2}`)
    .replace(/^\/\/:(\s)/gm, (_, $1) => `${hexForwardSlash}/:${$1}`)
    .replace(/^```/gm, () => `${hexGraveAccent}\`\``)
    .replace(
      /^(\\d+)([.)])(\\s)/gm,
      (_e, $1, $2, $3) => `${$1}${toHexCharCode($2)}${$3}`,
    )
    .replace(/^\[(\^.+?\]:)/gm, (_e, n) => `${hexLeftSquareBracket}${n}`)
}

export function extractBlockTextContent(node: ProseMirrorNode) {
  if (node.type.name === 'doc') throw new Error('use toMarkdown instead')
  if (basicContainers.includes(node.type.name)) {
    return sanitizerText(node.textContent)
  }
  if (node.type.name === 'heading') {
    return `${'#'.repeat(node.attrs.level)} ${node.textContent}`
  }
  throw new Error('unknown node')
}

export function extractTextContent(node: RootContent | RootContent[]): string {
  if (!isArray(node)) {
    if ('value' in node) {
      return node.value
    }
    if (isParentContent(node)) {
      return concatChildren(node.children)
    }
  } else {
    return concatChildren(node)
  }

  return ''
}

export function concatChildren(children: RootContent[]) {
  const result = []

  for (let i = 0; i < children.length; i++) {
    const content = children[i]
    result[i] = extractTextContent(content)
  }
  return result.join('')
}