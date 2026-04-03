import { TableKit } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table/cell'
import { TableHeader } from '@tiptap/extension-table/header'

// Allow all block nodes except `table` inside table cells to prevent nested tables
const tableCellContent =
  '(paragraph | heading | bulletList | orderedList | blockquote | codeBlock | horizontalRule | callout | embed | image)+'

const NoNestedTableCell = TableCell.extend({ content: tableCellContent })
const NoNestedTableHeader = TableHeader.extend({ content: tableCellContent })

export const TableExt = [
  TableKit.configure({
    table: { resizable: true, cellMinWidth: 240 },
    tableCell: false,
    tableHeader: false,
  }),
  NoNestedTableCell,
  NoNestedTableHeader,
]
