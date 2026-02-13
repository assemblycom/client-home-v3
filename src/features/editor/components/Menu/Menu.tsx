import {
  editorActionConfig,
  getAllActionsFromConfig,
  handleToolbarAction,
  MenuMode,
} from '@editor/components/Menu/menuConfig'
import type { Editor, Range } from '@tiptap/core'
import { SlashMenu, Toolbar, ToolbarProvider } from 'copilot-design-system'
import { useMemo } from 'react'
import { cn } from '@/utils/tailwind'

export interface MenuProps {
  mode: MenuMode
  query?: string //filter slash menu items
  editor?: Editor // Editor instance for slash commands
  range?: Range // Range to delete when executing slash commands
}

export const Menu = ({ mode, query, editor, range }: MenuProps) => {
  const filteredActionIds = useMemo(() => {
    if (mode !== MenuMode.SLASH_MENU || !query) {
      return undefined // Show all actions
    }

    const allActions = getAllActionsFromConfig(editorActionConfig(mode))
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return undefined
    }

    const filtered = allActions.filter((action) => action.label.toLowerCase().startsWith(normalizedQuery))

    return filtered.map((a) => a.id)
  }, [mode, query])

  return (
    <ToolbarProvider
      config={editorActionConfig(mode)}
      onAction={(actionData) => handleToolbarAction(actionData, editor, range)}
      editor={editor}
    >
      {mode === MenuMode.SLASH_MENU ? (
        <SlashMenu overrideActions={filteredActionIds} />
      ) : (
        <Toolbar
          variant="sticky"
          className={cn(
            'cop-bg-white [&_button]:!bg-white [&_button:hover]:!bg-background-secondary [&_button:active]:!bg-background-secondary',
          )}
        />
      )}
    </ToolbarProvider>
  )
}
