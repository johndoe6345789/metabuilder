'use client'

import { useState } from 'react'
import { COMPONENT_CATALOG } from './component-catalog'
import { TreeNodeRow } from './TreeNodeRow'
import type { ComponentNode } from './types'
import s from './TreeNode.module.scss'

type Props = {
  node: ComponentNode
  allNodes: ComponentNode[]
  depth: number
  selectedId: string | null
  expandedIds: Set<string>
  draggingId: string | null
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onConfig: (id: string) => void
  onDragStart: (id: string) => void
  onDrop: (targetId: string) => void
}

export function TreeNode({
  node, allNodes, depth, selectedId, expandedIds,
  draggingId, onSelect, onToggle, onRemove, onConfig,
  onDragStart, onDrop,
}: Props) {
  const [isOver, setIsOver] = useState(false)
  const children = allNodes
    .filter(n => n.parentId === node.id)
    .sort((a, b) => a.order - b.order)
  const isExpanded = expandedIds.has(node.id)
  const def = COMPONENT_CATALOG.find(d => d.type === node.type)
  const canDrop = def?.allowsChildren === true

  return (
    <div className={s.root}>
      <TreeNodeRow
        type={node.type}
        depth={depth}
        childCount={children.length}
        isExpanded={isExpanded}
        isSelected={selectedId === node.id}
        isDragging={draggingId === node.id}
        isOver={isOver}
        onRowClick={() => { onSelect(node.id) }}
        onCaretClick={e => {
          e.stopPropagation()
          if (children.length > 0) onToggle(node.id)
        }}
        onConfig={e => {
          e.stopPropagation()
          onConfig(node.id)
        }}
        onRemove={e => {
          e.stopPropagation()
          onRemove(node.id)
        }}
        onDragStart={e => {
          e.stopPropagation()
          onDragStart(node.id)
        }}
        onDragOver={e => {
          if (canDrop) {
            e.preventDefault()
            e.stopPropagation()
            setIsOver(true)
          }
        }}
        onDragLeave={() => { setIsOver(false) }}
        onDrop={e => {
          e.preventDefault()
          e.stopPropagation()
          setIsOver(false)
          if (canDrop) onDrop(node.id)
        }}
      />

      {isExpanded && children.map(child => (
        <TreeNode
          key={child.id}
          node={child}
          allNodes={allNodes}
          depth={depth + 1}
          selectedId={selectedId}
          expandedIds={expandedIds}
          draggingId={draggingId}
          onSelect={onSelect}
          onToggle={onToggle}
          onRemove={onRemove}
          onConfig={onConfig}
          onDragStart={onDragStart}
          onDrop={onDrop}
        />
      ))}
    </div>
  )
}
