import { createPortal } from 'react-dom'
import { cn } from '@/components/utils'
import type { RefObjectType } from '@/features/editor/components/Popper/type'
import { usePopper } from '@/features/editor/components/Popper/usePopper'

type PopperProps = {
  isOpen?: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactNode
  triggerRef: RefObjectType
} & React.HTMLAttributes<HTMLDivElement>

export const Popper = ({ isOpen = false, setIsOpen, children, className, triggerRef }: PopperProps) => {
  const { coords, popperRef } = usePopper({ isOpen, setIsOpen, triggerRef })

  if (!isOpen) return null

  return createPortal(
    <div
      ref={popperRef}
      style={{
        position: 'absolute',
        ...(coords.top === 0 && coords.left === 0 && { display: 'none' }),
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 50,
      }}
      className={cn('fade-in zoom-in-95 min-w-37.5 animate-in duration-200', className)}
    >
      {children}
    </div>,
    document.body,
  )
}
