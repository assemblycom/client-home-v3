'use client'

import { Menu } from '@editor/components/Menu'
import { MenuMode } from '@editor/components/Menu/menuConfig'

import type { SuggestionProps } from '@tiptap/suggestion'
import { forwardRef, useImperativeHandle } from 'react'

/**
 * Simplified adapter that wraps the existing Menu component for slash commands
 * This reuses the Menu component in SLASH_MENU mode instead of duplicating configuration
 */

type CommandsListHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean
}

export const SlashMenuAdapter = forwardRef<CommandsListHandle, SuggestionProps>(function SlashMenuAdapter(props, ref) {
  const { query, editor, range } = props
  useImperativeHandle(
    ref,
    () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape', ' '].includes(event.key)) {
          return true
        }
        return false
      },
    }),
    [],
  )

  return <Menu mode={MenuMode.SLASH_MENU} query={query} editor={editor} range={range} />
})
