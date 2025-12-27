import type React from 'react'
import { toast } from 'sonner'
import { componentCatalog } from '@/lib/components/component-catalog'
import { Database, ComponentNode } from '@/lib/database'

type AddComponentParams = {
  componentType: string
  parentId?: string
  selectedPageId: string
  hierarchy: Record<string, ComponentNode>
  componentIdPrefix: string
  getRootNodes: () => ComponentNode[]
  loadHierarchy: () => Promise<void>
  setExpandedNodes: React.Dispatch<React.SetStateAction<Set<string>>>
}

type DeleteComponentParams = {
  nodeId: string
  hierarchy: Record<string, ComponentNode>
  loadHierarchy: () => Promise<void>
}

export async function addComponent({
  componentType,
  parentId,
  selectedPageId,
  hierarchy,
  componentIdPrefix,
  getRootNodes,
  loadHierarchy,
  setExpandedNodes,
}: AddComponentParams) {
  if (!selectedPageId) {
    toast.error('Please select a page first')
    return
  }

  const componentDef = componentCatalog.find(c => c.type === componentType)
  if (!componentDef) return

  const newNode: ComponentNode = {
    id: `node_${componentIdPrefix}_${Object.keys(hierarchy).length}`,
    type: componentType,
    parentId,
    childIds: [],
    order: parentId ? hierarchy[parentId]?.childIds.length || 0 : getRootNodes().length,
    pageId: selectedPageId,
  }

  if (parentId && hierarchy[parentId]) {
    await Database.updateComponentNode(parentId, {
      childIds: [...hierarchy[parentId].childIds, newNode.id],
    })
  }

  await Database.addComponentNode(newNode)
  await loadHierarchy()
  setExpandedNodes(prev => new Set([...prev, parentId || '']))
  toast.success(`Added ${componentType}`)
}

export async function deleteComponent({ nodeId, hierarchy, loadHierarchy }: DeleteComponentParams) {
  const node = hierarchy[nodeId]
  if (!node) return

  const deleteRecursive = async (id: string) => {
    const current = hierarchy[id]
    if (!current) return

    for (const childId of current.childIds) {
      await deleteRecursive(childId)
    }
    await Database.deleteComponentNode(id)
  }

  if (node.parentId && hierarchy[node.parentId]) {
    const parent = hierarchy[node.parentId]
    await Database.updateComponentNode(node.parentId, {
      childIds: parent.childIds.filter(id => id !== nodeId),
    })
  }

  await deleteRecursive(nodeId)
  await loadHierarchy()
  toast.success('Component deleted')
}
