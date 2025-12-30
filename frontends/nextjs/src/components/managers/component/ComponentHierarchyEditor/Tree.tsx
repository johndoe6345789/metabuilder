import { Cursor } from '@/fakemui/icons'
import type React from 'react'

import type { ComponentNode } from '@/lib/database'

import { TreeNode } from '../modules/TreeNode'

interface HierarchyTreeProps {
  rootNodes: ComponentNode[]
  hierarchy: Record<string, ComponentNode>
  selectedNodeId: string | null
  expandedNodes: Record<string, boolean>
  draggingNodeId: string | null
  onSelect: (nodeId: string) => void
  onToggle: (nodeId: string) => void
  onDelete: (nodeId: string) => Promise<void>
  onConfig: (nodeId: string) => void
  onDragStart: (event: React.DragEvent, nodeId: string) => void
  onDragOver: (event: React.DragEvent, nodeId: string) => void
  onDrop: (event: React.DragEvent, nodeId: string) => void
}

export function HierarchyTree({
  rootNodes,
  hierarchy,
  selectedNodeId,
  expandedNodes,
  draggingNodeId,
  onSelect,
  onToggle,
  onDelete,
  onConfig,
  onDragStart,
  onDragOver,
  onDrop,
}: HierarchyTreeProps) {
  if (rootNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Cursor size={48} className="mb-4" />
        <p>No components yet. Add one from the catalog!</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {rootNodes.map(node => (
        <TreeNode
          key={node.id}
          node={node}
          hierarchy={hierarchy}
          selectedNodeId={selectedNodeId}
          expandedNodes={expandedNodes}
          onSelect={onSelect}
          onToggle={onToggle}
          onDelete={onDelete}
          onConfig={onConfig}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          draggingNodeId={draggingNodeId}
        />
      ))}
    </div>
  )
}
