import { TableKit } from '@tiptap/extension-table'

// Simple table implementation for now
export const TableExt = TableKit.configure({
  table: { resizable: true },
})
