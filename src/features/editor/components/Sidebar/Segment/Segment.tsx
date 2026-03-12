'use client'

import { useConfirmationDialog } from '@common/hooks/useConfirmationDialog'
import { useSidebarStore } from '@editor/stores/sidebarStore'
import { SegmentCreationCard } from '@segments/components/SegmentCreationCard'
import { SegmentList } from '@segments/components/SegmentList'
import { useSegmentMutations } from '@segments/hooks/useSegmentMutations'
import { useSegmentStats } from '@segments/hooks/useSegments'

export const Segment = () => {
  const { stats, isLoading, isFetching } = useSegmentStats()
  const { deleteSegment } = useSegmentMutations()
  const setCurrentSegment = useSidebarStore((s) => s.setCurrentSegment)
  const { confirm, dialogComponent } = useConfirmationDialog({
    title: 'Delete Segment',
    description:
      'Are you sure you want to delete this segment? All associated settings will be removed. This action cannot be undone.',
    isDangerous: true,
    resolveText: 'Delete',
  })

  const segmentSettings = stats?.settings.filter((s) => !!s.segment) ?? []
  const lockedCustomFieldKey = segmentSettings.length > 0 ? segmentSettings[0].segment!.customField : null

  const handleEdit = (segmentId: string) => {
    const setting = segmentSettings.find((s) => s.segment!.id === segmentId)
    if (!setting?.segment) return
    setCurrentSegment({
      id: setting.segment.id,
      name: setting.segment.name,
      customField: setting.segment.customField,
      conditions: setting.segment.conditions.map((c) => ({ compareValue: c.compareValue })),
    })
  }

  const handleDelete = async (segmentId: string) => {
    const confirmed = await confirm()
    if (confirmed) {
      deleteSegment.mutate(segmentId)
    }
  }

  const handleCreateSegment = (customFieldKey: string) => {
    setCurrentSegment({ customField: customFieldKey })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="overflow-hidden rounded border border-border-gray">
          <div className="flex items-center gap-2 border-border-gray border-b px-4 py-3">
            <div className="size-2 shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex items-center gap-2 border-border-gray border-b px-4 py-3">
            <div className="size-2 shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="size-2 shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="h-24 animate-pulse rounded border border-border-gray bg-background-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-text-secondary leading-5.25">
        By default, all clients see the same content. Create segments to tailor your homepage for different clients.
      </p>
      {stats && (
        <div className={deleteSegment.isPending || isFetching ? 'pointer-events-none animate-pulse opacity-60' : ''}>
          <SegmentList settings={stats.settings} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      )}
      <SegmentCreationCard
        segmentCount={segmentSettings.length}
        lockedCustomFieldKey={lockedCustomFieldKey}
        hasClients={(stats?.totalClients ?? 0) > 0}
        onCreateSegment={handleCreateSegment}
      />
      {dialogComponent}
    </div>
  )
}
