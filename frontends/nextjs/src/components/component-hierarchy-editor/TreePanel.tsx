'use client'

import { useState } from 'react'
import { Typography, Button } from '@/m3'
import { TreeNode } from './TreeNode'
import type { ComponentNode } from './types'
import s from './TreePanel.module.scss'

type Props = {
  nodes: ComponentNode[]
  pages: string[]
  selectedPage: string
  selectedNodeId: string | null
  expandedIds: Set<string>
  onPageChange: (page: string) => void
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onConfig: (id: string) => void
  onMove: (id: string, parentId: string | null, order: number) => void
}

export function TreePanel({
  nodes, pages, selectedPage, selectedNodeId, expandedIds,
  onPageChange, onSelect, onToggle, onRemove, onConfig, onMove,
}: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const pageNodes = nodes.filter(n => n.pageId === selectedPage)
  const roots = pageNodes
    .filter(n => n.parentId == null)
    .sort((a, b) => a.order - b.order)

  function handleDrop(targetId: string) {
    if (draggingId == null || draggingId === targetId) {
      setDraggingId(null)
      return
    }
    const siblings = pageNodes.filter(n => n.parentId === targetId)
    onMove(draggingId, targetId, siblings.length)
    setDraggingId(null)
  }

  return (
    <div className={s.root}>
      <div className={s.header}>
        <Typography variant="subtitle2">Component Tree</Typography>
        <div className={s.pageSelector}>
          {pages.map(page => (
            <Button
              key={page}
              size="small"
              variant={selectedPage === page ? 'contained' : 'outlined'}
              onClick={() => { onPageChange(page) }}
            >
              {page}
            </Button>
          ))}
        </div>
      </div>

      <div className={s.tree}>
        {roots.length === 0 ? (
          <div className={s.empty}>
            <Typography variant="body2" color="text.secondary">
              No components yet. Add one from the catalog.
            </Typography>
          </div>
        ) : roots.map(root => (
          <TreeNode
            key={root.id}
            node={root}
            allNodes={pageNodes}
            depth={0}
            selectedId={selectedNodeId}
            expandedIds={expandedIds}
            draggingId={draggingId}
            onSelect={onSelect}
            onToggle={onToggle}
            onRemove={onRemove}
            onConfig={onConfig}
            onDragStart={id => { setDraggingId(id) }}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  )
}
