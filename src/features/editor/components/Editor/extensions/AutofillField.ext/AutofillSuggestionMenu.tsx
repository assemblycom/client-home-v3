'use client'

import type { SuggestionProps } from '@tiptap/suggestion'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { cn } from '@/utils/tailwind'
import type { AutofillItem } from './autofill.utils'

export type AutofillSuggestionMenuHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean
}

export const AutofillSuggestionMenu = forwardRef<AutofillSuggestionMenuHandle, SuggestionProps<AutofillItem>>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    // biome-ignore lint/correctness/useExhaustiveDependencies: <need to reset when items changes>
    useEffect(() => setSelectedIndex(0), [props.items])

    const selectItem = (index: number) => {
      const item = props.items[index]
      if (item) props.command(item)
    }

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((i) => (i - 1 + props.items.length) % props.items.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % props.items.length)
          return true
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }
        return false
      },
    }))

    if (props.items.length === 0) {
      return (
        <div className="rounded-md border border-border-gray bg-white p-2 shadow-md">
          <p className="px-2 py-1 text-text-secondary text-xs">No fields found</p>
        </div>
      )
    }

    return (
      <div className="max-h-72 min-w-48 overflow-y-auto rounded-md border border-border-gray bg-white py-1 shadow-md">
        {props.items.map((item, index) => (
          <button
            type="button"
            key={item.value}
            className={cn(
              'w-full px-3 py-1.5 text-left text-sm hover:bg-background-primary',
              index === selectedIndex && 'bg-background-primary',
            )}
            onClick={() => selectItem(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
    )
  },
)

AutofillSuggestionMenu.displayName = 'AutofillSuggestionMenu'
