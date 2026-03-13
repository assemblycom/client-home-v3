import { useConfirmationDialog } from '@common/hooks/useConfirmationDialog'
import { SegmentCardItem } from '@segments/components/segment-list/SegmentCardItem'
import { useSegmentMutations } from '@segments/hooks/useSegmentMutations'
import type { SegmentStatsSettings } from '@segments/lib/segments.dto'

type SegmentListProps = {
  segments: SegmentStatsSettings[]
}

export const SegmentList = ({ segments }: SegmentListProps) => {
  const { deleteSegment } = useSegmentMutations()
  const { confirm, dialogComponent } = useConfirmationDialog({
    title: 'Delete Segment',
    description:
      'Are you sure you want to delete this segment? All associated settings will be removed. This action cannot be undone.',
    isDangerous: true,
    resolveText: 'Delete',
  })

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
            onDelete={() => handleDelete(segment.id)}
          />
        )
      })}
      {dialogComponent}
    </div>
  )
}
