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

// Shared pill shell so the loading and loaded states are pixel-identical.
const PILL_BASE =
  'flex min-w-0 items-center gap-2 rounded-md border border-[#eff1f4] bg-white p-3 text-text-secondary dark-bg:border-white/20 dark-bg:bg-white/10 dark-bg:text-white/70'

export const ActionItem = ({ action, isLoading, mode, className, count }: ActionItemProps) => {
  const clientId = useAuthStore((s) => s.clientId)
  const tasksAppId = useViewStore((s) => s.tasksAppId)

  // In preview the noun agrees with the resolved count; in editor the count is a
  // placeholder, so we always fall back to the plural noun.
  const noun = (
    mode === ViewMode.PREVIEW && count === 1 ? (action.singularLabel ?? action.label) : action.label
  ).toLocaleLowerCase()

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
      <div className={cn(PILL_BASE, 'animate-pulse', className)}>
        <div className="size-4 shrink-0 rounded bg-gray-200 dark-bg:bg-white/20" />
        <div className="h-5 w-24 rounded bg-gray-200 dark-bg:bg-white/20" />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group text-left transition-colors duration-200',
        PILL_BASE,
        clientId && 'cursor-pointer hover:border-gray-300 dark-bg:hover:border-white/40',
        className,
      )}
    >
      <Icon icon={action.icon} className="size-4 shrink-0" />
      <span className="min-w-0 truncate font-medium text-sm">
        {action.verb}{' '}
        <HandleBarTemplate mode={mode} template={action.template} displayContent="{{N}}" fallbackValue={count ?? 0} />{' '}
        {noun}
      </span>
    </button>
  )
}
