/**
 * useAccordion Hook
 * Accordion state management supporting single or multiple open items
 *
 * @example
 * // Single mode - only one item open at a time
 * const accordion = useAccordion('single', ['item-1'])
 *
 * // Multiple mode - multiple items can be open
 * const accordion = useAccordion('multiple', ['item-1', 'item-2'])
 *
 * <AccordionItem id="item-1" expanded={accordion.isOpen('item-1')}>
 *   <AccordionTrigger onClick={() => accordion.toggleItem('item-1')}>
 *     Item 1
 *   </AccordionTrigger>
 *   <AccordionContent>Content 1</AccordionContent>
 * </AccordionItem>
 */

import { useState, useCallback } from 'react'

export interface UseAccordionReturn {
  /** Array of currently open item IDs */
  openItems: string[]
  /** Toggle an item open/closed */
  toggleItem: (id: string) => void
  /** Check if an item is open */
  isOpen: (id: string) => boolean
  /** Open a specific item */
  openItem: (id: string) => void
  /** Close a specific item */
  closeItem: (id: string) => void
  /** Close all items */
  closeAll: () => void
}

/**
 * Hook for managing accordion state
 * @param type - 'single' allows only one item open, 'multiple' allows many
 * @param defaultOpen - Array of initially open item IDs
 * @returns Object containing accordion state and control methods
 */
export function useAccordion(
  type: 'single' | 'multiple' = 'single',
  defaultOpen: string[] = []
): UseAccordionReturn {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen)

  const toggleItem = useCallback((id: string) => {
    if (type === 'single') {
      setOpenItems(prev => prev.includes(id) ? [] : [id])
    } else {
      setOpenItems(prev =>
        prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id]
      )
    }
  }, [type])

  const isOpen = useCallback((id: string) => openItems.includes(id), [openItems])

  const openItem = useCallback((id: string) => {
    if (type === 'single') {
      setOpenItems([id])
    } else {
      setOpenItems(prev => prev.includes(id) ? prev : [...prev, id])
    }
  }, [type])

  const closeItem = useCallback((id: string) => {
    setOpenItems(prev => prev.filter((item) => item !== id))
  }, [])

  const closeAll = useCallback(() => {
    setOpenItems([])
  }, [])

  return {
    openItems,
    toggleItem,
    isOpen,
    openItem,
    closeItem,
    closeAll,
  }
}
