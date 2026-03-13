import { useSidebarStore } from '@editor/stores/sidebarStore'
import type { SegmentStatsSettings } from '@segments/lib/segments.dto'
import { IconButton, Spinner } from 'copilot-design-system'
import { useEffect, useRef, useState } from 'react'

interface Props {
  data: SegmentStatsSettings
  onDelete: (segmentId?: string) => void
  isLoading?: boolean
}

export const SegmentCardItem = ({ data, onDelete, isLoading }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const setCurrentSegment = useSidebarStore((s) => s.setCurrentSegment)

  const handleEdit = () => {
    if (!data.id || !data.customField) {
      return
    }
    setCurrentSegment({
      id: data.id,
      name: data.name,
      customField: data.customField,
      conditions: data.conditions.map((c) => ({ compareValue: c.compareValue })),
    })

    setMenuOpen(false)
  }

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  // TODO:- use workspace override here..
  const countLabel = `${data.clientsCount} ${data.clientsCount === 1 ? 'client' : 'clients'}`

  return (
    <div
      className={`group relative flex items-start justify-between border-border-gray border-t px-4 pt-4 pb-3 first:border-t-0 ${isLoading ? 'cursor-wait' : ''}`}
    >
      {isLoading && <div className="absolute inset-0 z-10 bg-white/50" />}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="text-sm text-text-primary leading-5">{data.name}</span>
        </div>
        <span className="text-text-secondary text-xs leading-4">{countLabel}</span>
      </div>
      {!!data.id && (
        <div className="relative" ref={menuRef}>
          {isLoading ? (
            <div className="flex size-8 items-center justify-center">
              <Spinner size={5} />
            </div>
          ) : (
            <IconButton
              icon="Ellipsis"
              variant="minimal"
              className="opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setMenuOpen(!menuOpen)}
            />
          )}
          {menuOpen && !isLoading && (
            <div className="absolute top-full right-0 z-10 mt-1 w-32 rounded border border-border-gray bg-white shadow-md">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                onClick={handleEdit}
              >
                Edit
              </button>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-red-600 text-sm hover:bg-gray-50"
                onClick={() => {
                  onDelete?.()
                  setMenuOpen(false)
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
