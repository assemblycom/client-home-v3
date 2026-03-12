'use client'

import { Icon } from 'copilot-design-system'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/tailwind'

export type SelectOption = {
  value: string
  label: string
}

type SelectProps = {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  error?: boolean
  className?: string
}

export const Select = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  error = false,
  className,
}: SelectProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          'flex w-full items-center justify-between rounded border bg-white py-2 pr-2.5 pl-3 text-sm outline-none',
          error ? 'border-[#991a00]' : 'border-border-gray',
          !error && !disabled && 'hover:border-[#212b36]',
          disabled ? 'cursor-not-allowed text-text-secondary opacity-70' : 'cursor-pointer text-text-primary',
        )}
      >
        <span className={cn(!selectedOption && 'text-text-secondary')}>{selectedOption?.label ?? placeholder}</span>
        <Icon
          icon="ChevronDown"
          width={16}
          height={16}
          className={cn('shrink-0 text-text-secondary transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-border-gray bg-white py-1 shadow-md">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm hover:bg-[#f4f5f7]',
                  opt.value === value ? 'font-medium text-text-primary' : 'text-text-primary',
                )}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
