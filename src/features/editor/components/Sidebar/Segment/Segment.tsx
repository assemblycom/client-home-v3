'use client'

import { CustomFieldType } from '@assembly/types'
import { useSidebarStore } from '@editor/stores/sidebarStore'
import { useViewStore } from '@editor/stores/viewStore'
import { SegmentCreationCard } from '@segments/components/SegmentCreationCard'
import { SegmentDeletedFieldCard } from '@segments/components/SegmentDeletedFieldCard'
import { SegmentList } from '@segments/components/segment-list/SegmentList'
import { useSegmentStats } from '@segments/hooks/useSegments'
import { useCustomFields } from '@/features/custom-fields/hooks/useCustomFields'

export const Segment = () => {
  const { segments, segmentConfig, totalClients, isLoading, isFetching } = useSegmentStats()
  const { clientCustomFields, companyCustomFields, isLoading: customFieldsLoading } = useCustomFields()
  const setCurrentSegment = useSidebarStore((s) => s.setCurrentSegment)
  const activeSegmentId = useViewStore((s) => s.activeSegmentId)

  const lockedCustomFieldId = segmentConfig?.customFieldId
  const allTagFields = [...clientCustomFields, ...companyCustomFields].filter((f) => f.type === CustomFieldType.TAGS)
  const hasDeletedCustomField =
    !customFieldsLoading &&
    !!segmentConfig?.customFieldId &&
    allTagFields.length > 0 &&
    !allTagFields.some((f) => f.id === segmentConfig.customFieldId)

  const handleCreateSegment = () => {
    setCurrentSegment({})
  }

  const activeSegment = segments?.find((s) => s.id === activeSegmentId) ?? segments?.[0]
  const activeSegmentList = activeSegment ? [activeSegment] : []

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-5 animate-pulse rounded-sm bg-gray-200" />
        <div className="overflow-hidden rounded border border-border-gray">
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="size-2 shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
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
      {!!activeSegmentList.length && (
        <div className={isFetching ? 'pointer-events-none animate-pulse opacity-60' : ''}>
          <SegmentList segments={activeSegmentList} />
        </div>
      )}
      {hasDeletedCustomField ? (
        <SegmentDeletedFieldCard />
      ) : (
        <SegmentCreationCard
          segmentCount={segments?.length || 0}
          lockedCustomFieldId={lockedCustomFieldId}
          hasClients={!!totalClients}
          onCreateSegment={handleCreateSegment}
        />
      )}
    </div>
  )
}
