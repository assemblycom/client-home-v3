import type { SuggestionProps } from '@tiptap/suggestion'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { clampIndex } from '@/utils/array'
import type { SlashCommandItem } from './types'

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
  }, [items.length, selectedIndex])

  useImperativeHandle(ref, () => ({ onKeyDown: handlers.onKeyDown }), [handlers])

  if (!items.length) return null

  return (
    <div className="flex flex-col">
      {items.map((item, index) => (
        <button
          key={item.title.replaceAll(' ', '-')}
          type="button"
          className={index === selectedIndex ? 'text-red-400' : ''}
          onClick={() => selectItem(index)}
        >
          <div className="menu-wrapper">
            <div className="menu-title">{item.element ?? item.title}</div>
          </div>
        </button>
      ))}
    </div>
  )
})
