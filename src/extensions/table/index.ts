import { type Union, union } from 'prosekit/core'
import {
  type TableCellSpecExtension,
  type TableHeaderSpecExtension,
  type TableRowSpecExtension,
  type TableSpecExtension,
  defineTableCellSpec,
  defineTableHeaderSpec,
  defineTableRowSpec,
  defineTableSpec,
} from './spec'

export function defineTable() {
  return union([
    defineTableSpec(),
    defineTableRowSpec(),
    defineTableHeaderSpec(),
    defineTableCellSpec(),
  ])
}

export type TableExtension = Union<
  [
    TableSpecExtension,
    TableRowSpecExtension,
    TableHeaderSpecExtension,
    TableCellSpecExtension,
  ]
>
