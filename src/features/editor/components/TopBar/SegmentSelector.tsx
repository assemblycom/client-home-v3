import { Popper } from '@editor/components/Popper'
import { useViewStore } from '@editor/stores/viewStore'
import { useSegmentStats } from '@segments/hooks/useSegments'
import { Icon } from 'copilot-design-system'
import { useRef, useState } from 'react'
import { cn } from '@/utils/tailwind'

export const SegmentSelector = () => {
  const { stats } = useSegmentStats()
  const activeSegmentId = useViewStore((s) => s.activeSegmentId)
  const setActiveSegmentId = useViewStore((s) => s.setActiveSegmentId)
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const segmentSettings = stats?.settings.filter((s) => !!s.segment) ?? []

  if (segmentSettings.length === 0) return null

  const activeSegment = segmentSettings.find((s) => s.segment!.id === activeSegmentId)
  const label = activeSegment ? activeSegment.segment!.name : 'Default'

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
        className="box-content flex min-h-7 max-w-48 items-center gap-2.5 whitespace-nowrap rounded-sm border border-border-gray px-2 py-0.5 text-[13px] leading-[21px]"
      >
        <div className="truncate">
          <span className="text-text-secondary">Editing: </span>
          <span>{label}</span>
        </div>
        <Icon icon="ChevronDown" name="arrow-down" height={10} width={10} className="text-text-primary" />
      </button>
      <Popper isOpen={isOpen} setIsOpen={setIsOpen} triggerRef={triggerRef} className="bg-white!">
        <div className="flex flex-col rounded-md border border-border-gray bg-white py-1 shadow-md">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={cn(
              'px-3 py-1.5 text-left text-[13px] leading-[21px] hover:bg-background-secondary',
              activeSegmentId === null && 'bg-background-secondary',
            )}
          >
            Default
          </button>
          {segmentSettings.map((setting) => (
            <button
              type="button"
              key={setting.segment!.id}
              onClick={() => handleSelect(setting.segment!.id)}
              className={cn(
                'px-3 py-1.5 text-left text-[13px] leading-[21px] hover:bg-background-secondary',
                activeSegmentId === setting.segment!.id && 'bg-background-secondary',
              )}
            >
              {setting.segment!.name}
            </button>
          ))}
        </div>
      </Popper>
    </>
  )
}
