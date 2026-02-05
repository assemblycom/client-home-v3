import { DisplayMode, useViewStore } from '@editor/stores/viewStore'
import { DesktopIcon, MobileIcon } from '@/icons'
import { cn } from '@/utils/tailwind'

export function DisplayModeTab() {
  const displayMode = useViewStore((store) => store.displayMode)
  const changeView = useViewStore((store) => store.changeView)

  const onClick = (displayMode: DisplayMode) => {
    changeView({
      displayMode,
    })
  }
  return (
    <div className="box-content flex flex-items-center gap-2 rounded-sm border border-gray-200 p-1 text-primary">
      <button
        type="button"
        onClick={() => onClick(DisplayMode.DESKTOP)}
        className={cn(
          'grid h-6.5 w-9.5 cursor-pointer place-content-center rounded-xs',
          displayMode === DisplayMode.DESKTOP ? 'bg-background-secondary text-secondary' : '',
        )}
      >
        <DesktopIcon className="aspect-square w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onClick(DisplayMode.MOBILE)}
        className={cn(
          'grid h-6.5 w-9.5 cursor-pointer place-content-center rounded-xs',
          displayMode === DisplayMode.MOBILE ? 'bg-background-secondary text-text-secondary' : '',
        )}
      >
        <MobileIcon className="aspect-square w-3.5" />
      </button>
    </div>
  )
}
