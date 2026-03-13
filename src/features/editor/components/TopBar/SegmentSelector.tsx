import { Popper } from '@editor/components/Popper'
import { useViewStore } from '@editor/stores/viewStore'
import { useSegmentStats } from '@segments/hooks/useSegments'
import type { FormattedSegmentData } from '@segments/lib/segments.dto'
import { Icon } from 'copilot-design-system'
import { useRef, useState } from 'react'
import { cn } from '@/utils/tailwind'

export const SegmentSelector = () => {
  const { segments } = useSegmentStats()
  const activeSegmentId = useViewStore((s) => s.activeSegmentId)
  const setActiveSegmentId = useViewStore((s) => s.setActiveSegmentId)
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  if (!segments || segments?.length < 2) return null

  const activeSegment =
    segments.find((segment) => segment?.id === activeSegmentId) || (segments.at(0) as FormattedSegmentData)

  const handleSelect = (segmentId: string | null) => {
    setActiveSegmentId(segmentId)
    setIsOpen(false)
  }

  return (
    <>
      <div className="h-5 w-px bg-border-gray" />
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="box-content flex min-h-7 max-w-48 items-center gap-2.5 whitespace-nowrap rounded-sm border border-border-gray px-2 py-0.5 text-body-sm"
      >
        <div className="truncate">
          <span className="text-text-secondary">Editing: </span>
          <span>{activeSegment.name}</span>
        </div>
        <Icon icon="ChevronDown" name="arrow-down" height={10} width={10} className="text-text-primary" />
      </button>
      <Popper isOpen={isOpen} setIsOpen={setIsOpen} triggerRef={triggerRef} className="bg-white!">
        <div className="flex flex-col rounded-md border border-border-gray bg-white py-1 shadow-md">
          {segments.map((segment) => (
            <button
              type="button"
              key={segment?.settingId}
              onClick={() => handleSelect(segment?.id || null)}
              className={cn(
                'px-3 py-1.5 text-left text-body-sm hover:bg-background-secondary',
                activeSegmentId === segment?.id && 'bg-background-secondary',
              )}
            >
              {segment.name}
            </button>
          ))}
        </div>
      </Popper>
    </>
  )
}
