'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ComponentNode, ComponentDef } from './types'
import { loadNodes, saveNodes } from './tree-storage'

const DEFAULT_PAGES: [string, ...string[]] = ['home', 'dashboard', 'profile']

export type UseComponentTreeReturn = {
  nodes: ComponentNode[]
  selectedNodeId: string | null
  expandedIds: Set<string>
  selectedPage: string
  pages: string[]
  addNode: (def: ComponentDef, parentId?: string | null) => void
  removeNode: (id: string) => void
  moveNode: (
    id: string, newParentId: string | null, newOrder: number,
  ) => void
  updateNode: (
    id: string,
    props: Record<string, unknown>,
    styles: Record<string, string>,
  ) => void
  selectNode: (id: string | null) => void
  toggleExpand: (id: string) => void
  setSelectedPage: (page: string) => void
}

export function useComponentTree(): UseComponentTreeReturn {
  const [pages] = useState<string[]>(DEFAULT_PAGES)
  const [selectedPage, setSelectedPage] =
    useState<string>(DEFAULT_PAGES[0])
  const [nodes, setNodes] = useState<ComponentNode[]>(() =>
    loadNodes(DEFAULT_PAGES[0]),
  )
  const [selectedNodeId, setSelectedNodeId] =
    useState<string | null>(null)
  const [expandedIds, setExpandedIds] =
    useState<Set<string>>(new Set())

  useEffect(() => {
    setNodes(loadNodes(selectedPage))
    setSelectedNodeId(null)
    setExpandedIds(new Set())
  }, [selectedPage])

  useEffect(() => {
    saveNodes(selectedPage, nodes)
  }, [nodes, selectedPage])

  const addNode = useCallback(
    (def: ComponentDef, parentId: string | null = null) => {
      const siblings = nodes.filter(n =>
        parentId == null
          ? n.parentId == null && n.pageId === selectedPage
          : n.parentId === parentId,
      )
      const newNode: ComponentNode = {
        id: `node_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        type: def.type,
        parentId,
        order: siblings.length,
        pageId: selectedPage,
        props: { ...def.defaultProps },
        styles: {},
      }
      setNodes(prev => [...prev, newNode])
      if (parentId != null) {
        setExpandedIds(prev => new Set([...prev, parentId]))
      }
    },
    [nodes, selectedPage],
  )

  const removeNode = useCallback((id: string) => {
    setNodes(prev => {
      const toDelete = new Set<string>()
      const collect = (nodeId: string) => {
        toDelete.add(nodeId)
        prev.filter(n => n.parentId === nodeId)
          .forEach(n => { collect(n.id) })
      }
      collect(id)
      return prev.filter(n => !toDelete.has(n.id))
    })
    setSelectedNodeId(prev => (prev === id ? null : prev))
  }, [])

  const moveNode = useCallback(
    (id: string, newParentId: string | null, newOrder: number) => {
      setNodes(prev =>
        prev.map(n =>
          n.id === id
            ? { ...n, parentId: newParentId, order: newOrder }
            : n,
        ),
      )
    },
    [],
  )

  const updateNode = useCallback(
    (
      id: string,
      props: Record<string, unknown>,
      styles: Record<string, string>,
    ) => {
      setNodes(prev =>
        prev.map(n => (n.id === id ? { ...n, props, styles } : n)),
      )
    },
    [],
  )

  return {
    nodes,
    selectedNodeId,
    expandedIds,
    selectedPage,
    pages,
    addNode,
    removeNode,
    moveNode,
    updateNode,
    selectNode: useCallback(
      (id: string | null) => { setSelectedNodeId(id) }, [],
    ),
    toggleExpand: useCallback((id: string) => {
      setExpandedIds(prev => {
        const next = new Set(prev)
        if (next.has(id)) { next.delete(id) } else { next.add(id) }
        return next
      })
    }, []),
    setSelectedPage: useCallback((page: string) => {
      setSelectedPage(page)
    }, []),
  }
}
