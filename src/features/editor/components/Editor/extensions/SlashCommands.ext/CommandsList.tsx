'use client'

import type { SlashCommandItem } from '@extensions/SlashCommands.ext/types'
import type { SuggestionProps } from '@tiptap/suggestion'
import clsx from 'clsx'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { clampIndex } from '@/utils/array'

export type CommandsListHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean
}

type Props = SuggestionProps<SlashCommandItem>

export const CommandsList = forwardRef<CommandsListHandle, Props>(function CommandsList({ items, command }, ref) {
  // We still use forwardRef here because Tiptap does not support React's ref forwarding yet + we have to expose an imperitive handle
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = items[index]
    if (item) command(item)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: Force recompute handlers when items changes.
  const handlers = useMemo(() => {
    const up = () => setSelectedIndex((i) => clampIndex(i - 1, items.length))
    const down = () => setSelectedIndex((i) => clampIndex(i + 1, items.length))
    const enter = () => selectItem(clampIndex(selectedIndex, items.length))

    const onKeyDown = (event: KeyboardEvent): boolean => {
      if (!items.length) return false

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          up()
          return true
        case 'ArrowDown':
          event.preventDefault()
          down()
          return true
        case 'Enter':
          event.preventDefault()
          enter()
          return true
        default:
          return false
      }
    }

    return { onKeyDown }
    // selectedIndex is used by enter()
  }, [items.length, selectedIndex, command])

  useImperativeHandle(ref, () => ({ onKeyDown: handlers.onKeyDown }), [handlers])

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
