import {
  type ActionConfig,
  editorActionConfig,
  getActionState,
  getAllActionsFromConfig,
  handleToolbarAction,
  MenuMode,
} from '@editor/components/Menu/menuConfig'
import { useEditorStore } from '@editor/stores/editorStore'
import type { Editor, Range } from '@tiptap/core'
import { SlashMenu, Toolbar, ToolbarProvider } from 'copilot-design-system'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/utils/tailwind'

export interface MenuProps {
  mode: MenuMode
  query?: string //filter slash menu items
  editor?: Editor // Editor instance for slash commands
  range?: Range // Range to delete when executing slash commands
  items?: ActionConfig[] // Items passed from suggestion extension
}

export const Menu = ({ mode, query, editor, range, items }: MenuProps) => {
  const storeEditor = useEditorStore((s) => s.editor)
  const activeEditor = editor ?? storeEditor

  const filteredActionIds = useMemo(() => {
    if (mode !== MenuMode.SLASH_MENU) {
      return undefined // Show all actions
    }
    if (items) {
      return items.map((a) => a.id)
    }
    if (!query) {
      return undefined
    }

    const allActions = getAllActionsFromConfig(editorActionConfig(mode))
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return undefined
    }

    const filtered = allActions.filter((action) => action.label.toLowerCase().startsWith(normalizedQuery))

    return filtered.map((a) => a.id)
  }, [mode, query, items])

  //Right now implemented a hacky way to rerender the editor.
  //Recently, we applied mechanism to listen to the editor changes. Listen to that instead of doing this after it gets merged.
  //Ref: useAppControls.
  const [, forceUpdate] = useState({})

  useEffect(() => {
    if (!activeEditor) return

    const update = () => forceUpdate({})

    activeEditor.on('transaction', update)
    activeEditor.on('selectionUpdate', update)

    return () => {
      activeEditor.off('transaction', update)
      activeEditor.off('selectionUpdate', update)
    }
  }, [activeEditor])

  return (
    <ToolbarProvider
      config={editorActionConfig(mode)}
      onAction={(actionData) => activeEditor && handleToolbarAction(actionData, activeEditor, range)}
      editor={activeEditor}
      getActionState={(actionId) => getActionState(activeEditor, actionId)}
    >
      {mode === MenuMode.SLASH_MENU ? (
        <SlashMenu overrideActions={filteredActionIds} />
      ) : (
        <Toolbar
          variant="sticky"
          className={cn(
            'cop-bg-white [&_button:not([data-active=true]):not([aria-pressed=true]):not(:hover)]:!bg-white [&_button:hover]:!bg-background-secondary [&_button[data-active=true]]:!bg-background-secondary [&_button[aria-pressed=true]]:!bg-background-secondary [&_button:active]:!bg-background-secondary',
          )}
        />
      )}
    </ToolbarProvider>
  )
}
