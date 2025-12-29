import { useCallback, useEffect, useState } from 'react'

import { type ComponentNode,Database } from '@/lib/database'
import type { PageConfig } from '@/lib/level-types'

interface UseHierarchyDataResult {
  pages: PageConfig[]
  selectedPageId: string
  setSelectedPageId: (pageId: string) => void
  hierarchy: Record<string, ComponentNode>
  loadHierarchy: () => Promise<void>
}

export function useHierarchyData(): UseHierarchyDataResult {
  const [pages, setPages] = useState<PageConfig[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string>('')
  const [hierarchy, setHierarchy] = useState<Record<string, ComponentNode>>({})

  const loadPages = useCallback(async () => {
    const loadedPages = await Database.getPages()
    setPages(loadedPages)
    if (loadedPages.length > 0 && !selectedPageId) {
      setSelectedPageId(loadedPages[0].id)
    }
  }, [selectedPageId])

  const loadHierarchy = useCallback(async () => {
    const allHierarchy = await Database.getComponentHierarchy()
    setHierarchy(allHierarchy)
  }, [])

  useEffect(() => {
    loadPages()
    loadHierarchy()
  }, [loadPages, loadHierarchy])

  useEffect(() => {
    if (selectedPageId) {
      loadHierarchy()
    }
  }, [selectedPageId, loadHierarchy])

  return {
    pages,
    selectedPageId,
    setSelectedPageId,
    hierarchy,
    loadHierarchy,
  }
}
