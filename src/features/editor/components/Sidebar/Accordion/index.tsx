'use client'

import { Icon } from 'copilot-design-system'
import type { ReactNode } from 'react'
import { cn } from '@/components/utils'
import { useAccordion } from '@/features/editor/components/Sidebar/Accordion/useAccordion'

export type AccordionProps = {
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
        className="flex w-full items-center justify-between py-4 text-left focus:outline-none"
      >
        <span className="font-medium text-gray-900 leading-6">{title}</span>
        <Icon
          icon="ChevronRight"
          width={16}
          height={16}
          className={cn('m-1.5 text-text-primary transition-all duration-100 ease-in-out', isOpen ? 'rotate-90' : '')}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-100 ease-in-out',
          isOpen ? 'my-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className={isOpen ? 'block' : 'hidden'}>{content}</div>
      </div>
    </div>
  )
}
