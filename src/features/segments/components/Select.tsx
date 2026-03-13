import { Icon } from '@assembly-js/design-system'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/utils/tailwind'

export type SelectOption = {
  value: string
  label: string
}

export type SelectOptionGroup = {
  label: string
  options: SelectOption[]
  optionClassName?: string
}

type SelectProps = {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  groups?: SelectOptionGroup[]
  placeholder?: string
  disabled?: boolean
  error?: boolean
  className?: string
}

export const Select = ({
  value,
  onChange,
  options,
  groups,
  placeholder = 'Select...',
  disabled = false,
  error = false,
  className,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const flatOptions = useMemo(() => {
    if (groups) {
      return groups.flatMap((g) => g.options)
    }
    return options
  }, [groups, options])

  const selectedLabel = flatOptions.find((o) => o.value === value)?.label

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const selectedIndex = flatOptions.findIndex((o) => o.value === value)
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    }
  }, [isOpen, flatOptions, value])

  const selectOption = useCallback(
    (optionValue: string) => {
      onChange(optionValue)
      setIsOpen(false)
    },
    [onChange],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return

      switch (e.key) {
        case 'Enter':
        case ' ': {
          e.preventDefault()
          if (!isOpen) {
            setIsOpen(true)
          } else if (highlightedIndex >= 0 && highlightedIndex < flatOptions.length) {
            selectOption(flatOptions[highlightedIndex].value)
          }
          break
        }
        case 'ArrowDown': {
          e.preventDefault()
          if (!isOpen) {
            setIsOpen(true)
          } else {
            setHighlightedIndex((prev) => (prev < flatOptions.length - 1 ? prev + 1 : prev))
          }
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          if (isOpen) {
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          }
          break
        }
        case 'Escape': {
          e.preventDefault()
          setIsOpen(false)
          break
        }
        case 'Tab': {
          setIsOpen(false)
          break
        }
      }
    },
    [disabled, isOpen, highlightedIndex, flatOptions, selectOption],
  )

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return
    const listEl = listRef.current
    if (!listEl) return
    const items = listEl.querySelectorAll('[role="option"]')
    const highlighted = items[highlightedIndex] as HTMLElement | undefined
    highlighted?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, highlightedIndex])

  const renderOptions = () => {
    if (groups) {
      let flatIndex = 0
      return groups.map((group) => {
        if (group.options.length === 0) return null
        const items = group.options.map((opt) => {
          const currentIndex = flatIndex++
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onClick={() => selectOption(opt.value)}
              onMouseEnter={() => setHighlightedIndex(currentIndex)}
              className={cn(
                'w-full truncate px-3 py-[5px] text-left text-sm text-text-primary',
                opt.value === value && 'bg-background-primary',
                currentIndex === highlightedIndex && 'bg-background-primary',
                group.optionClassName,
              )}
            >
              {opt.label}
            </button>
          )
        })
        return (
          <div key={group.label}>
            <div className="px-3 pt-2 pb-1 font-medium text-text-secondary text-xs uppercase tracking-wide">
              {group.label}
            </div>
            {items}
          </div>
        )
      })
    }

    return options.map((opt, index) => (
      <button
        key={opt.value}
        type="button"
        role="option"
        aria-selected={opt.value === value}
        onClick={() => selectOption(opt.value)}
        onMouseEnter={() => setHighlightedIndex(index)}
        className={cn(
          'w-full truncate px-3 py-[5px] text-left text-sm text-text-primary',
          opt.value === value && 'bg-background-primary',
          index === highlightedIndex && 'bg-background-primary',
        )}
      >
        {opt.label}
      </button>
    ))
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between rounded border bg-white py-2 pr-2.5 pl-3 text-left text-sm outline-none',
          error ? 'border-error' : 'border-border-gray',
          disabled ? 'cursor-not-allowed text-text-secondary opacity-70' : 'text-text-primary',
          isOpen && !error && 'border-primary',
        )}
      >
        <span className={cn('truncate', !selectedLabel && 'text-text-secondary')}>{selectedLabel || placeholder}</span>
        <Icon
          icon="ChevronDown"
          width={16}
          height={16}
          className={cn('shrink-0 text-text-secondary transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-border-popper bg-white pb-1 shadow-[0px_6px_20px_rgba(0,0,0,0.07)]"
        >
          {renderOptions()}
        </div>
      )}
    </div>
  )
}
