import { TableKit } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table/cell'
import { TableHeader } from '@tiptap/extension-table/header'
import { TableKeyboard } from './table-keyboard'
import { TableTouchSelection } from './table-touch-selection'

// Allow all block nodes except `table` inside table cells to prevent nested tables
const tableCellContent =
  '(paragraph | heading | bulletList | orderedList | blockquote | codeBlock | horizontalRule | callout | embed | image)+'

const NoNestedTableCell = TableCell.extend({ content: tableCellContent })
const NoNestedTableHeader = TableHeader.extend({ content: tableCellContent })

export const TableExt = [
  TableKit.configure({
    table: { resizable: true, renderWrapper: true, cellMinWidth: 240 },
    tableCell: false,
    tableHeader: false,
  }),
  NoNestedTableCell,
  NoNestedTableHeader,
  TableKeyboard,
  TableTouchSelection,
]
