import type { SegmentStatsSettings } from '@segments/lib/segments.dto'
import { IconButton } from 'copilot-design-system'
import { useEffect, useRef, useState } from 'react'

type SegmentRowProps = {
  name: string
  color: string
  count: number
  isDefault?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

const SegmentRow = ({ name, color, count, isDefault = false, onEdit, onDelete }: SegmentRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const countLabel = `${count} ${count === 1 ? 'client' : 'clients'}`

  return (
    <div className="group flex items-start justify-between border-border-gray border-t px-4 pt-4 pb-3 first:border-t-0">
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm text-text-primary leading-5">{name}</span>
        </div>
        <span className="text-text-secondary text-xs leading-4">{countLabel}</span>
      </div>
      {!isDefault && (
        <div className="relative" ref={menuRef}>
          <IconButton
            icon="Ellipsis"
            variant="minimal"
            className="opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && (
            <div className="absolute top-full right-0 z-10 mt-1 w-32 rounded border border-border-gray bg-white shadow-md">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                onClick={() => {
                  onEdit?.()
                  setMenuOpen(false)
                }}
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

type SegmentListProps = {
  settings: SegmentStatsSettings[]
  onEdit: (segmentId: string) => void
  onDelete: (segmentId: string) => void
}

export const SegmentList = ({ settings, onEdit, onDelete }: SegmentListProps) => {
  const defaultSetting = settings.find((s) => !s.segment)
  const segmentSettings = settings.filter((s) => !!s.segment)

  return (
    <div className="overflow-visible rounded border border-border-gray">
      {defaultSetting && <SegmentRow name="Default" color="#DFE1E4" count={defaultSetting.clientsCount} isDefault />}
      {segmentSettings.map((setting) => (
        <SegmentRow
          key={setting.segment!.id}
          name={setting.segment!.name}
          color={setting.segment!.color}
          count={setting.clientsCount}
          onEdit={() => onEdit(setting.segment!.id)}
          onDelete={() => onDelete(setting.segment!.id)}
        />
      ))}
    </div>
  )
}
