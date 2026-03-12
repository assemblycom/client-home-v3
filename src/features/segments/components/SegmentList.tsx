'use client'

import type { SegmentResponseDto, SegmentStatsResponseDto } from '@segments/lib/segments.dto'
import { IconButton } from 'copilot-design-system'
import { useEffect, useRef, useState } from 'react'

const SEGMENT_COLORS = ['#E7B04A', '#56C6BE', '#E9728B', '#7B68EE', '#4CAF50'] as const
const DEFAULT_COLOR = '#E3E5E8'

type SegmentRowProps = {
  name: string
  color: string
  count?: number
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

  return (
    <div className="group flex items-center justify-between border-border-gray border-b px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-2">
        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm text-text-primary leading-5">{name}</span>
        {count !== undefined && <span className="text-sm text-text-secondary leading-5">{count}</span>}
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
  segments: SegmentResponseDto[]
  stats: SegmentStatsResponseDto | null
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const SegmentList = ({ segments, stats, onEdit, onDelete }: SegmentListProps) => {
  const statsByName = stats ? new Map(stats.stats.map((s) => [s.name, s])) : null

  const getSegmentStat = (name: string, index: number) => {
    const stat = statsByName?.get(name)
    return {
      color: stat?.color ?? SEGMENT_COLORS[index % SEGMENT_COLORS.length],
      count: stat?.count,
    }
  }

  const defaultCount = stats ? stats.totalClients - stats.stats.reduce((sum, s) => sum + s.count, 0) : undefined

  return (
    <div className="overflow-visible rounded border border-border-gray">
      <SegmentRow name="Default" color={DEFAULT_COLOR} count={defaultCount} isDefault />
      {segments.map((segment, index) => {
        const { color, count } = getSegmentStat(segment.name, index)
        return (
          <SegmentRow
            key={segment.id}
            name={segment.name}
            color={color}
            count={count}
            onEdit={() => onEdit(segment.id)}
            onDelete={() => onDelete(segment.id)}
          />
        )
      })}
    </div>
  )
}
