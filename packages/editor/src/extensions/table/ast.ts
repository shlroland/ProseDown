import type { Union } from 'prosekit/core'
import type { TableExtension } from '.'
import type { BasicExtension } from '..'
import { registerAstFrom } from '../../markdown/methods'

export const astTableFrom = registerAstFrom<TableExtension>()(
  'table',
  (ctx, ast, text) => {
    const { align } = ast
    const children = ast.children.map((child, index) => ({
      ...child,
      align,
      isHeader: index === 0,
    }))

    const nodes = ctx.fromChildrenContent(children, text, ast)
    const table = ctx.editor.nodes.table
    return table(...nodes)
  },
)

export const astTableRowFrom = registerAstFrom<TableExtension>()(
  'tableRow',
  (ctx, ast, text) => {
    const { align, isHeader } = ast
    const children = ast.children.map((child, index) => ({
      ...child,
      align: align?.[index],
      isHeader,
    }))

    const nodes = ctx.fromChildrenContent(children, text, ast)
    const tableRow = ctx.editor.nodes.tableRow
    return tableRow(...nodes)
  },
)

export const astTableCellFrom = registerAstFrom<
  Union<[TableExtension, BasicExtension]>
>()('tableCell', (ctx, ast, text) => {
  const paragraph = ctx.editor.nodes.paragraph
  const child = paragraph(...ctx.fromPhrasingContent(ast, text, []))
  const action = ast.isHeader
    ? ctx.editor.nodes.tableHeader
    : ctx.editor.nodes.tableCell
  return action({ alignment: ast.align }, child)
})
