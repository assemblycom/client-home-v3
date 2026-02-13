import { editorActionConfig, handleToolbarAction, MenuMode } from '@editor/components/Menu/menuConfig'
import { SlashMenu, Toolbar, ToolbarProvider } from 'copilot-design-system'
import { cn } from '@/utils/tailwind'

export interface MenuProps {
  mode: MenuMode
}

export const Menu = ({ mode }: MenuProps) => {
  return (
    <ToolbarProvider config={editorActionConfig()} onAction={handleToolbarAction}>
      {mode === MenuMode.SLASH_MENU ? (
        <SlashMenu />
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
