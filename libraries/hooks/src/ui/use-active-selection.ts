import { useState, useEffect } from 'react'

export function useActiveSelection<T extends { id: string }>(items: T[], defaultId?: string | null) {
  const [activeId, setActiveId] = useState<string | null>(defaultId || null)

  useEffect(() => {
    if (items.length > 0 && !activeId) {
      setActiveId(items[0].id)
    }
  }, [items, activeId])

  const activeItem = items.find(item => item.id === activeId)

  const selectNext = () => {
    if (!activeId || items.length === 0) return
    const currentIndex = items.findIndex(item => item.id === activeId)
    const nextIndex = (currentIndex + 1) % items.length
    setActiveId(items[nextIndex].id)
  }

  const selectPrevious = () => {
    if (!activeId || items.length === 0) return
    const currentIndex = items.findIndex(item => item.id === activeId)
    const previousIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
    setActiveId(items[previousIndex].id)
  }

  const selectFirst = () => {
    if (items.length > 0) {
      setActiveId(items[0].id)
    }
  }

  const selectLast = () => {
    if (items.length > 0) {
      setActiveId(items[items.length - 1].id)
    }
  }

  return {
    activeId,
    setActiveId,
    activeItem,
    selectNext,
    selectPrevious,
    selectFirst,
    selectLast,
  }
}
