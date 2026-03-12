import { useState } from 'react'

export const useAccordion = (defaultOpen = false) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return { isOpen, setIsOpen }
}
