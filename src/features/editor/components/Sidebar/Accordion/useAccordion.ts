import { useState } from 'react'

export const useAccordion = () => {
  const [isOpen, setIsOpen] = useState(false)
  return { isOpen, setIsOpen }
}
