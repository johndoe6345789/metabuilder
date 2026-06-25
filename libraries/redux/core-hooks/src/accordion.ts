/**
 * useAccordion Hook
 * Accordion item toggle management (single or multiple)
 */

import { useState } from 'react'

export interface UseAccordionReturn {
  openItems: string[]
  toggleItem: (id: string) => void
  isOpen: (id: string) => boolean
}

/**
 * Manages accordion state
 * @param type - 'single' or 'multiple' open items
 * @param defaultOpen - Initially open item IDs
 */
export function useAccordion(
  type: 'single' | 'multiple' = 'single',
  defaultOpen: string[] = []
): UseAccordionReturn {
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
