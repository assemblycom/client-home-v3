import type { ActionDefinition } from '@editor/components/Sidebar/Actions/constant'
import { ViewMode } from '@editor/stores/viewStore'
import { Icon } from 'copilot-design-system'
import { HandleBarTemplate } from '@/features/handlebar-template/components/handle-bar-template'
import { cn } from '@/utils/tailwind'

interface Props {
  action: ActionDefinition
  isLoading?: boolean
  mode: ViewMode
  className?: string
  portalUrl?: string
}

export const ActionItem = ({ action, isLoading, mode, className, portalUrl }: Props) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border-gray bg-white p-5 lg:min-w-56',
        isLoading
          ? 'animate-pulse md:min-w-56'
          : 'group cursor-pointer transition-all duration-300 hover:border-gray-300 hover:shadow-md',
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
              <h2 className="text-heading-md">{action.label}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-body-md text-text-secondary">
            <HandleBarTemplate
              className={cn(mode === ViewMode.PREVIEW ? 'text-text-primary' : '')}
              mode={mode}
              template={action.template}
              fallbackValue={1}
            />
            {mode === ViewMode.PREVIEW ? ` ${action.singularLabel?.toLocaleLowerCase()}` : null}
          </div>
          <a href={`${portalUrl}/${action.appUrlPath}`} className="flex items-center gap-2 text-body-md">
            View all <Icon icon={'ArrowRight'} className="size-3.25" />
          </a>
        </>
      )}
    </div>
  )
}
