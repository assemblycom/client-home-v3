'use client'
import { Button } from 'copilot-design-system'
import { SegmentCard } from '@/features/editor/components/Sidebar/Segment/SegmentCard'

export const Segment = () => {
  return (
    <>
      <div className="text-[13px] text-text-secondary leading-5.25">
        By default, all clients see the same content. Create segments to tailor your homepage for certain clients.
      </div>
      <div className="mt-3 mb-2 flex flex-col gap-3">
        <SegmentCard />
        <Button label="Create Segment" variant="secondary" className="w-full" />
      </div>
    </>
  )
}
