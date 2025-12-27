import { useCallback, useEffect, useId, useState } from 'react'
import { Database, ComponentNode } from '@/lib/database'
import type { PageConfig } from '@/lib/level-types'
import { addComponent, deleteComponent } from './hierarchyMutations'

type HierarchyState = {
  pages: PageConfig[]
  selectedPageId: string
  setSelectedPageId: (pageId: string) => void
  hierarchy: Record<string, ComponentNode>
  selectedNodeId: string | null
  setSelectedNodeId: (nodeId: string | null) => void
  expandedNodes: Set<string>
  setExpandedNodes: React.Dispatch<React.SetStateAction<Set<string>>>
  configNodeId: string | null
  openConfig: (nodeId: string | null) => void
  loadHierarchy: () => Promise<void>
  getRootNodes: () => ComponentNode[]
  toggleNode: (nodeId: string) => void
  expandAll: () => void
  collapseAll: () => void
  handleAddComponent: (componentType: string, parentId?: string) => Promise<void>
  handleDeleteNode: (nodeId: string) => Promise<void>
}

export function useHierarchyState(): HierarchyState {
  const [pages, setPages] = useState<PageConfig[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string>('')
  const [hierarchy, setHierarchy] = useState<Record<string, ComponentNode>>({})
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [configNodeId, setConfigNodeId] = useState<string | null>(null)
  const componentIdPrefix = useId()

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

  const getRootNodes = useCallback(() => {
    return Object.values(hierarchy)
      .filter(node => node.pageId === selectedPageId && !node.parentId)
      .sort((a, b) => a.order - b.order)
  }, [hierarchy, selectedPageId])

  const handleAddComponent = useCallback(
    (componentType: string, parentId?: string) =>
      addComponent({
        componentType,
        parentId,
        selectedPageId,
        hierarchy,
        componentIdPrefix,
        getRootNodes,
        loadHierarchy,
        setExpandedNodes,
      }),
    [componentIdPrefix, getRootNodes, hierarchy, loadHierarchy, selectedPageId]
  )

  const handleDeleteNode = useCallback(
    (nodeId: string) => deleteComponent({ nodeId, hierarchy, loadHierarchy }),
    [hierarchy, loadHierarchy]
  )

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpandedNodes(new Set(Object.keys(hierarchy)))
  }, [hierarchy])

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set())
  }, [])

  const openConfig = useCallback((nodeId: string | null) => {
    setConfigNodeId(nodeId)
  }, [])

  return {
    pages,
    selectedPageId,
    setSelectedPageId,
    hierarchy,
    selectedNodeId,
    setSelectedNodeId,
    expandedNodes,
    setExpandedNodes,
    configNodeId,
    openConfig,
    loadHierarchy,
    getRootNodes,
    toggleNode,
    expandAll,
    collapseAll,
    handleAddComponent,
    handleDeleteNode,
  }
}
