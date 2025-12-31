import { useRef, useState } from 'react'

export const useBackgroundColor = () => {
  const triggerRef = useRef<HTMLDivElement>(null)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [isOpen, setIsOpen] = useState(false)

  const togglePopper = () => setIsOpen((prev) => !prev)

  return { backgroundColor, setBackgroundColor, triggerRef, isOpen, setIsOpen, togglePopper }
}
