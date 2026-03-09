import { useAuthStore } from '@auth/providers/auth.provider'
import type { ActionDefinition } from '@editor/components/Sidebar/Actions/constant'
import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { Icon } from 'copilot-design-system'
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

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border-gray bg-white p-5 lg:min-w-56',
        isLoading ? '@md:min-w-56 animate-pulse' : 'group transition-all duration-300',
        className,
      )}
    >
      {isLoading ? (
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gray-200" />
          <div className="h-5 w-32 rounded bg-gray-200" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon icon={action.icon} className="size-4 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="text-heading-md">{action.label}</h3>
            </div>
            <button
              type="button"
              onClick={handleClick}
              className="hidden cursor-pointer lg:block"
              aria-label={`View ${action.label}`}
            >
              <Icon icon="ArrowRight" width={12.5} height={12.5} className="text-text-secondary" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-body-md text-text-secondary">
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
        </>
      )}
    </div>
  )
}
