import { useRef, useState } from 'react'

export const useBackgroundColorPopup = () => {
  const triggerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const togglePopper = () => setIsOpen((prev) => !prev)

  return { triggerRef, isOpen, setIsOpen, togglePopper }
}
