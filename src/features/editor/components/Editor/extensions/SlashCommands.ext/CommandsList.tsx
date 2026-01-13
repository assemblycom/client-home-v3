'use client'

import type { SlashCommandItem } from '@extensions/SlashCommands.ext/types'
import type { SuggestionProps } from '@tiptap/suggestion'
import clsx from 'clsx'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { clampIndex } from '@/utils/array'

export type CommandsListHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean
}

type Props = SuggestionProps<SlashCommandItem>

export const CommandsList = forwardRef<CommandsListHandle, Props>(function CommandsList(props, ref) {
  const { items, command } = props
  const [selectedIndex, setSelectedIndex] = useState(0)

  // keep latest values
  const latest = useRef({ items, command, selectedIndex })

  useEffect(() => {
    latest.current = { items, command, selectedIndex }
  }, [items, command, selectedIndex])

  const selectItem = (index: number) => {
    const { items, command } = latest.current
    const item = items[index]
    if (item) command(item)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown(event) {
      const { items, selectedIndex } = latest.current
      if (!items.length) return false

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((i) => clampIndex(i - 1, items.length))
          return true
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((i) => clampIndex(i + 1, items.length))
          return true
        case 'Enter':
          event.preventDefault()
          selectItem(clampIndex(selectedIndex, items.length))
          return true
        default:
          return false
      }
    },
  }))
  // no deps needed; it always reads latest.current

  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset selected index when items changes.
  useEffect(() => setSelectedIndex(0), [items])

  if (!items.length) return null

  return (
    <div className="relative flex w-48 flex-col gap-0.5 overflow-hidden rounded border border-border-popper bg-white py-2 shadow-vairant-1">
      {items.map((item, index) => (
        <button
          key={item.title.replaceAll(' ', '-')}
          type="button"
          className={clsx(index === selectedIndex && 'bg-background-primary')}
          onClick={() => selectItem(index)}
        >
          <div className="flex cursor-pointer items-center gap-x-2.5 px-3 py-1.5">
            <item.Icon />
            <div className="text-sm">{item.element ?? item.title}</div>
          </div>
        </button>
      ))}
    </div>
  )
})
