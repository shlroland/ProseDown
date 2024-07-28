import type { Node, Paragraph, ParentContent } from 'mdast'

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

export const sanitizerText = (t: string) => {
  return t
    .replace(/^ /gm, '&#x20;')
    .replace(/ $/gm, '&#x20;')
    .replace(/^([>#])/gm, (_e, n) => toHexCharCode(n))
    .replace(/^([*+-])(\\s)/gm, (_e, n, r) => `${toHexCharCode(n)}${r}`)
    .replace(/^\/\/:(\s)/gm, (_e, n) => `${hexForwardSlash}/:${n}`)
    .replace(/^```/gm, () => `${hexGraveAccent}\`\``)
    .replace(
      /^(\\d+)([.)])(\\s)/gm,
      (_e, n, r, i) => `${n}${toHexCharCode(r)}${i}`
    )
    .replace(/^\[(\^.+?\]:)/gm, (_e, n) => `${hexLeftSquareBracket}${n}`)
}
