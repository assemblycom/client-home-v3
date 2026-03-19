'use client'

import type { FieldItem } from '@editor/components/Editor/extensions/AutofillField.ext/autofill-fields.config'
import { useDynamicFields } from '@editor/components/Sidebar/DynamicFields/useDynamicFields'
import type { SuggestionProps } from '@tiptap/suggestion'
import { type Ref, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { cn } from '@/utils/tailwind'

export type AutofillSuggestionMenuHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean
}

type Props = SuggestionProps<FieldItem> & { ref?: Ref<AutofillSuggestionMenuHandle> }

export function AutofillSuggestionMenu({ ref, ...props }: Props) {
  const { dynamicFields, isLoading } = useDynamicFields()

  const filteredItems = useMemo(() => {
    const normalized = props.query.toLowerCase()
    return (
      normalized ? dynamicFields.filter((item) => item.label.toLowerCase().includes(normalized)) : dynamicFields
    ).slice(0, 10)
  }, [dynamicFields, props.query])

  const [selectedIndex, setSelectedIndex] = useState(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset selection when filtered list changes
  useEffect(() => setSelectedIndex(0), [filteredItems])

  const selectItem = (index: number) => {
    const item = filteredItems[index]
    if (item) props.command(item)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % filteredItems.length)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  if (isLoading) {
    return (
      <div className="min-w-48 rounded-md border border-border-gray bg-white p-2 shadow-md">
        <div className="space-y-1.5 px-2 py-1">
          {(['60%', '75%', '60%', '90%'] as const).map((width) => (
            <div key={width} className="h-4 animate-pulse rounded bg-gray-200" style={{ width }} />
          ))}
        </div>
      </div>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <div className="rounded-md border border-border-gray bg-white p-2 shadow-md">
        <p className="px-2 py-1 text-text-secondary text-xs">No fields found</p>
      </div>
    )
  }

  return (
    <div className="max-h-72 min-w-48 overflow-y-auto overflow-hidden rounded-md border border-border-gray bg-white shadow-md">
      {filteredItems.map((item, index) => (
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
}
