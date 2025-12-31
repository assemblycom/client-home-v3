import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObjectType } from '@/features/editor/components/Popper/type'

export const usePopper = ({
  isOpen,
  setIsOpen,
  triggerRef,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: RefObjectType
}) => {
  const popperRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !popperRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const popperRect = popperRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let top = triggerRect.bottom + window.scrollY + 5
    let left = triggerRect.left + window.scrollX

    // Viewport awareness: Flip to top if no space at bottom
    if (triggerRect.bottom + popperRect.height > viewportHeight) {
      top = triggerRect.top + window.scrollY - popperRect.height - 5
    }

    // Viewport awareness: Adjust horizontal if overflowing
    if (left + popperRect.width > viewportWidth) {
      left = viewportWidth - popperRect.width - 10
    }
    if (left < 0) {
      left = 10
    }

    setCoords({ top, left })
  }, [triggerRef.current])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, updatePosition])

  // close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popperRef.current && !popperRef.current.contains(event.target as Node)) {
        isOpen && setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  return { coords, popperRef }
}
