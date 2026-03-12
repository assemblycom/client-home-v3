'use client'

import { useAuthStore } from '@auth/providers/auth.provider'
import { useSidebarStore } from '@editor/stores/sidebarStore'
import { SegmentCreationCard } from '@segments/components/SegmentCreationCard'
import { SegmentList } from '@segments/components/SegmentList'
import { useSegmentMutations } from '@segments/hooks/useSegmentMutations'
import { useSegmentStats } from '@segments/hooks/useSegments'
import type { SegmentResponseDto } from '@segments/lib/segments.dto'
import { api } from '@/lib/core/axios.instance'

export const Segment = () => {
  const token = useAuthStore((s) => s.token)
  const { stats, isLoading, isFetching } = useSegmentStats()
  const { deleteSegment } = useSegmentMutations()
  const setCurrentSegment = useSidebarStore((s) => s.setCurrentSegment)

  const segments = stats?.stats.filter((s) => s.id !== null) ?? []
  const segmentCount = segments.length

  const handleEdit = async (id: string) => {
    const res = await api.get<{ data: SegmentResponseDto }>(`/api/segments/${id}?token=${token}`)
    const segment = res.data.data
    setCurrentSegment({
      id: segment.id,
      name: segment.name,
      customField: segment.customField,
      conditions: segment.conditions.map((c) => ({ compareValue: c.compareValue })),
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this segment?')) {
      deleteSegment.mutate(id)
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
      <div className={isFetching && !isLoading ? 'animate-pulse' : ''}>
        <SegmentList stats={stats} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
      <SegmentCreationCard
        segmentCount={segmentCount}
        lockedCustomFieldKey={stats?.customField ?? null}
        onCreateSegment={handleCreateSegment}
      />
    </div>
  )
}
