import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, type Transaction } from '@tiptap/pm/state'

/**
 * Enforces that first-row cells are always `tableHeader` and other rows are always `tableCell`.
 * This handles copy/paste in both directions — header→body and body→header — without
 * needing to intercept clipboard HTML or transform slices.
 */
export const TableCellTypeEnforcer = Extension.create({
  name: 'tableCellTypeEnforcer',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tableCellTypeEnforcer'),
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some((tr) => tr.docChanged)) return null

          const { doc, schema } = newState
          const headerType = schema.nodes.tableHeader
          const cellType = schema.nodes.tableCell

          if (!headerType || !cellType) return null

          let tr: Transaction | null = null

          doc.descendants((node, pos) => {
            if (node.type.name !== 'table') return true

            node.forEach((row, rowOffset, rowIndex) => {
              if (row.type.name !== 'tableRow') return

              const expectedType = rowIndex === 0 ? headerType : cellType

              row.forEach((cell, cellOffset) => {
                if (cell.type !== expectedType && (cell.type === headerType || cell.type === cellType)) {
                  if (!tr) tr = newState.tr
                  const cellPos = pos + 1 + rowOffset + 1 + cellOffset
                  tr.setNodeMarkup(cellPos, expectedType, cell.attrs, cell.marks)
                }
              })
            })

            return false
          })

          return tr
        },
      }),
    ]
  },
})
