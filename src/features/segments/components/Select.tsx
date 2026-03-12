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
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedLabel = options.find((o) => o.value === value)?.label

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

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between rounded border bg-white py-2 pr-2.5 pl-3 text-left text-sm outline-none',
          error ? 'border-[#991a00]' : 'border-border-gray',
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
        <div className="absolute z-10 mt-1 max-h-32 w-full overflow-y-auto rounded border border-border-popper bg-white pb-1 shadow-[0px_6px_20px_rgba(0,0,0,0.07)]">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
              className={cn(
                'w-full truncate px-3 py-[5px] text-left text-sm text-text-primary hover:bg-background-primary',
                opt.value === value && 'bg-background-primary',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
