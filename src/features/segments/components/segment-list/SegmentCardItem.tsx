import type { SegmentStatsSettings } from '@segments/lib/segments.dto'
import { Icon, IconButton, Spinner } from 'copilot-design-system'
import { useEffect, useRef, useState } from 'react'

interface Props {
  data: SegmentStatsSettings
  onEdit: () => void
  onDelete: () => void
  isLoading?: boolean
}

export const SegmentCardItem = ({ data, onEdit, onDelete, isLoading }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleEdit = () => {
    onEdit()
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
  const count = data.clientsCount ?? 0
  const countLabel = `${count} ${count === 1 ? 'client' : 'clients'}`

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
            <div className="absolute top-full right-0 z-10 mt-1 w-[200px] rounded border border-border-gray bg-white py-0.5 shadow-lg">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-text-primary hover:bg-gray-50"
                onClick={handleEdit}
              >
                <Icon icon="Edit" width={16} height={16} />
                Update segment
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 px-5 py-3 text-left text-[#991A00] text-sm hover:bg-gray-50"
                onClick={() => {
                  onDelete?.()
                  setMenuOpen(false)
                }}
              >
                <Icon icon="Trash" width={16} height={16} />
                Delete segment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
