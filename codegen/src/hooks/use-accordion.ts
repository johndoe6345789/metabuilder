import { useState } from 'react'

export function useAccordion(type: 'single' | 'multiple' = 'single', defaultOpen: string[] = []) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen)

  const toggleItem = (id: string) => {
    if (type === 'single') {
      setOpenItems(openItems.includes(id) ? [] : [id])
    } else {
      setOpenItems(
        openItems.includes(id)
          ? openItems.filter((item) => item !== id)
          : [...openItems, id]
      )
    }
  }

  const isOpen = (id: string) => openItems.includes(id)

  return {
    openItems,
    toggleItem,
    isOpen,
  }
}
