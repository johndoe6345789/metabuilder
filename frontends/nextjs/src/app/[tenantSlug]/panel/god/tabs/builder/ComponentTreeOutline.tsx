'use client'

import type { TreeNode } from './builder-registry'
import type { DropWhere } from './component-tree-drop'
import { useOutlineDrag } from './use-outline-drag'
import { OutlineRowContent } from './OutlineRowContent'
import { outlineRowClassName } from './outline-row-classname'
import s from './ComponentTreeTab.module.scss'

export { NODE_MIME, PALETTE_MIME } from './use-outline-drag'

type Props = {
  node: TreeNode
  depth: number
  selectedId: string
  collapsed: ReadonlySet<string>
  onToggleCollapse: (id: string) => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onMove: (dragId: string, targetId: string, where: DropWhere) => void
  onAdd: (type: string, parentId: string) => void
}

export function ComponentTreeOutline({
  node,
  depth,
  selectedId,
  collapsed,
  onToggleCollapse,
  onSelect,
  onDelete,
  onMove,
  onAdd,
}: Props) {
  const { dropping, onDragStart, onDragOver, onDragLeave, onDrop } =
    useOutlineDrag({ nodeId: node.id, onAdd, onMove })
  const hasChildren = node.children.length > 0
  const isCollapsed = collapsed.has(node.id)

  return (
    <>
      <div
        className={outlineRowClassName(s, node.id === selectedId, dropping)}
        style={{ paddingLeft: 8 + depth * 16 }}
        onClick={() => {
          onSelect(node.id)
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <OutlineRowContent
          node={node}
          hasChildren={hasChildren}
          isCollapsed={isCollapsed}
          draggable={node.id !== 'root'}
          onToggleCollapse={onToggleCollapse}
          onDelete={onDelete}
          onDragStart={onDragStart}
        />
      </div>
      {!isCollapsed &&
        node.children.map(child => (
          <ComponentTreeOutline
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            collapsed={collapsed}
            onToggleCollapse={onToggleCollapse}
            onSelect={onSelect}
            onDelete={onDelete}
            onMove={onMove}
            onAdd={onAdd}
          />
        ))}
    </>
  )
}
