import { Icon } from '@assembly-js/design-system'
import { useAuthStore } from '@auth/providers/auth.provider'
import type { ActionDefinition } from '@editor/components/Sidebar/Actions/constant'
import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { HandleBarTemplate } from '@/features/handlebar-template/components/handle-bar-template'
import { cn } from '@/utils/tailwind'

interface ActionItemProps {
  action: ActionDefinition
  isLoading?: boolean
  mode: ViewMode
  className?: string
  portalUrl?: string
  count?: number
}

export const ActionItem = ({ action, isLoading, mode, className, count }: ActionItemProps) => {
  const clientId = useAuthStore((s) => s.clientId)
  const tasksAppId = useViewStore((s) => s.tasksAppId)

  const handleClick = () => {
    if (!clientId) return

    if (action.key === 'tasks' && tasksAppId) {
      window.parent.postMessage({ type: 'history.push', id: tasksAppId, route: 'apps' }, '*')
    } else {
      window.parent.postMessage({ type: 'history.push', route: action.key }, '*')
    }
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex @md:min-w-56 animate-pulse flex-col gap-3 rounded-lg border border-border-gray bg-white p-5 lg:min-w-56 dark-bg:border-white/20 dark-bg:bg-white/10',
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gray-200 dark-bg:bg-white/20" />
          <div className="h-5 w-32 rounded bg-gray-200 dark-bg:bg-white/20" />
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group flex flex-col gap-3 rounded-lg border border-border-gray bg-white p-5 text-left transition-all duration-300 lg:min-w-56 dark-bg:border-white/20 dark-bg:bg-white/10',
        clientId && 'cursor-pointer',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon
            icon={action.icon}
            className="size-4 transition-transform duration-300 group-hover:scale-110 dark-bg:text-white"
          />
          <h3 className="text-heading-md dark-bg:text-white">{action.label}</h3>
        </div>
        <Icon
          icon="ArrowRight"
          width={12.5}
          height={12.5}
          className="hidden text-text-secondary lg:block dark-bg:text-white/70"
        />
      </div>

      <div className="flex items-center gap-2 text-body-md text-text-secondary dark-bg:text-white/70">
        <HandleBarTemplate
          className={cn(mode === ViewMode.PREVIEW ? 'text-text-primary' : '')}
          mode={mode}
          template={action.template}
          fallbackValue={count ?? 0}
        />
        {mode === ViewMode.PREVIEW
          ? ` ${count === 1 ? action.singularLabel?.toLocaleLowerCase() : action.label.toLocaleLowerCase()}`
          : null}
      </div>
    </button>
  )
}
