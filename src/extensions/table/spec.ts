import { type Extension, defineNodeSpec } from 'prosekit/core'
import type { Attrs } from 'prosekit/pm/model'
import { tableNodes } from 'prosemirror-tables'

const originalSchema = tableNodes({
  tableGroup: 'block',
  cellContent: 'paragraph',
  cellAttributes: {
    alignment: {
      default: 'left',
      getFromDOM: (dom) => dom.style.textAlign || 'left',
      setDOMAttr: (value, attrs) => {
        attrs.style = `text-align: ${value || 'left'}`
      },
    },
  },
})

export function defineTableSpec() {
  return defineNodeSpec({
    ...originalSchema.table,
    name: 'table',
    content: 'tableRow+',
  })
}

export type TableSpecExtension = Extension<{
  Nodes: { table: Attrs }
}>

export function defineTableRowSpec() {
  return defineNodeSpec({
    ...originalSchema.table_row,
    name: 'tableRow',
    content: '(tableHeader | tableCell)*',
  })
}

export type TableRowSpecExtension = Extension<{
  Nodes: { tableRow: Attrs }
}>

export function defineTableHeaderSpec() {
  return defineNodeSpec({
    ...originalSchema.table_header,
    name: 'tableHeader',
  })
}

export type TableHeaderSpecExtension = Extension<{
  Nodes: { tableHeader: Attrs }
}>

export function defineTableCellSpec() {
  return defineNodeSpec({
    ...originalSchema.table_cell,
    name: 'tableCell',
  })
}

export type TableCellSpecExtension = Extension<{
  Nodes: { tableCell: Attrs }
}>
