import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { useNotificationCounts } from '@notification-counts/hooks/useNotificationCounts'
import type { NotificationCountsDto } from '@notification-counts/notification-counts.dto'
import { useEnabledActions } from '@settings/hooks/useEnabledActions'
import { useAppDisplayNames } from '@/features/action-items/hooks/useAppDisplayNames'
import { cn } from '@/utils/tailwind'
import { ActionItem } from './action-item'

interface ActionCardProps {
  readonly?: boolean
}

export const ActionsCard = ({ readonly }: ActionCardProps) => {
  const { enabledActions } = useEnabledActions()
  const viewMode = useViewStore((store) => store.viewMode)
  const workspace = useViewStore((store) => store.workspace)
  const { counts, isLoading: isCountsLoading } = useNotificationCounts()
  const { isLoading: isDisplayNamesLoading } = useAppDisplayNames()

  const isLoading = isCountsLoading || isDisplayNamesLoading
  const isPreviewMode = readonly || viewMode === ViewMode.PREVIEW

  // Client/preview only surfaces actions that actually have pending items. In the
  // editor, counts are placeholders, so we keep every enabled action visible so the
  // admin can still configure them.
  const visibleActions = isPreviewMode
    ? enabledActions.filter((action) => (counts?.[action.key as keyof NotificationCountsDto] ?? 0) > 0)
    : enabledActions

  const visibleCount = visibleActions.length

  // In the client/preview view, hold off until counts resolve so the section appears
  // fully formed or not at all — never flashing in and then collapsing.
  if (isPreviewMode && !counts) {
    return null
  }

  // Nothing pending → render no section at all. There is no empty state.
  if (!visibleCount) {
    return null
  }

  return (
    <div className="@container rounded-md border border-[#eaecf0] bg-background-primary p-3 transition-colors duration-500 dark-bg:border-white/20 dark-bg:bg-white/10">
      <h2 className="mb-2 font-medium text-sm text-text-primary dark-bg:text-white">Your actions</h2>

      <div
        className={cn(
          'grid grid-cols-1 gap-2',
          visibleCount >= 2 && '@min-[480px]:grid-cols-2',
          visibleCount >= 4 ? '@min-[768px]:grid-cols-4' : '@min-[768px]:grid-cols-3',
        )}
      >
        {visibleActions.map((action) => (
          <ActionItem
            key={action.key}
            isLoading={isLoading}
            action={action}
            mode={isPreviewMode ? ViewMode.PREVIEW : ViewMode.EDITOR}
            portalUrl={workspace?.portalUrl}
            count={counts?.[action.key as keyof NotificationCountsDto]}
          />
        ))}
      </div>
    </div>
  )
}
