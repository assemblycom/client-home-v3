import { useConfirmationDialog } from '@common/hooks/useConfirmationDialog'
import { useSidebarStore } from '@editor/stores/sidebarStore'
import { SegmentCardItem } from '@segments/components/segment-list/SegmentCardItem'
import { useSegmentMutations } from '@segments/hooks/useSegmentMutations'
import type { SegmentStatsSettings } from '@segments/lib/segments.dto'

type SegmentListProps = {
  segments: SegmentStatsSettings[]
}

export const SegmentList = ({ segments }: SegmentListProps) => {
  const { deleteSegment } = useSegmentMutations()
  const setCurrentSegment = useSidebarStore((s) => s.setCurrentSegment)
  const { confirm, dialogComponent } = useConfirmationDialog({
    title: 'Delete segment?',
    description: 'Clients in this segment will return to the default segment.',
    isDangerous: true,
    resolveText: 'Delete',
  })

  const handleEdit = (segment: SegmentStatsSettings) => {
    if (!segment.id || !segment.customField) {
      return
    }
    setCurrentSegment({
      id: segment.id,
      name: segment.name,
      customField: segment.customField,
      conditions: segment.conditions.map((c) => ({ compareValue: c.compareValue })),
    })
  }

  const handleDelete = async (segmentId?: string) => {
    if (!segmentId) {
      return
    }
    const confirmed = await confirm()
    if (confirmed) {
      deleteSegment.mutate(segmentId)
    }
  }

  return (
    <div className="overflow-visible rounded border border-border-gray">
      {segments.map((segment) => {
        return (
          <SegmentCardItem
            key={segment.settingId}
            data={segment}
            isLoading={deleteSegment.isPending && deleteSegment.variables === segment.id}
            onEdit={() => handleEdit(segment)}
            onDelete={() => handleDelete(segment.id)}
          />
        )
      })}
      {dialogComponent}
    </div>
  )
}
