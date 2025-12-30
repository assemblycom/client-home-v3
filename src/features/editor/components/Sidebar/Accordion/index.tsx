'use client'

import { Icon } from 'copilot-design-system'
import type { ReactNode } from 'react'
import { cn } from '@/components/utils'
import { useAccordion } from '@/features/editor/components/Sidebar/Accordion/useAccordion'

interface AccordionProps {
  title: string
  content: ReactNode
  className?: string
}

export const Accordion = ({ title, content, className }: AccordionProps) => {
  const { isOpen, setIsOpen } = useAccordion()
  return (
    <div className={cn('w-full', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 pr-5 pl-6 text-left focus:outline-none"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <Icon
          icon="ChevronRight"
          width={16}
          height={16}
          className={cn('text-text-primary transition-all duration-100 ease-in-out', isOpen ? 'rotate-90' : '')}
        />
      </button>
      <div
        className={cn(
          'grid px-6 transition-all duration-100 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-2 text-gray-600 text-sm">{content}</div>
        </div>
      </div>
    </div>
  )
}
