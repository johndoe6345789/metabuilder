import type React from 'react'
import { Badge, Button } from '@/components/ui'
import { CaretDown, CaretRight, GearSix, Trash, Tree } from '@phosphor-icons/react'
import { componentCatalog } from '@/lib/components/component-catalog'
import type { ComponentNode } from '@/lib/database'

type TreeNodeProps = {
  node: ComponentNode
  hierarchy: Record<string, ComponentNode>
  selectedNodeId: string | null
  expandedNodes: Set<string>
  onSelect: (nodeId: string) => void
  onToggle: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  onConfig: (nodeId: string) => void
  onDragStart: (nodeId: string) => void
  onDragOver: (event: React.DragEvent, nodeId: string) => void
  onDrop: (event: React.DragEvent, targetNodeId: string) => void
  draggingNodeId: string | null
}

export function TreeNode({
  node,
  hierarchy,
  selectedNodeId,
  expandedNodes,
  onSelect,
  onToggle,
  onDelete,
  onConfig,
  onDragStart,
  onDragOver,
  onDrop,
  draggingNodeId,
}: TreeNodeProps) {
  const hasChildren = node.childIds.length > 0
  const isExpanded = expandedNodes.has(node.id)
  const isSelected = selectedNodeId === node.id
  const isDragging = draggingNodeId === node.id

  const componentDef = componentCatalog.find(c => c.type === node.type)

  return (
    <div className="select-none">
      <div
        draggable
        onDragStart={() => onDragStart(node.id)}
        onDragOver={(event) => onDragOver(event, node.id)}
        onDrop={(event) => onDrop(event, node.id)}
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
          hover:bg-accent transition-colors group
          ${isSelected ? 'bg-accent' : ''}
          ${isDragging ? 'opacity-50' : ''}
        `}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            onClick={(event) => {
              event.stopPropagation()
              onToggle(node.id)
            }}
            className="hover:bg-secondary rounded p-0.5"
          >
            {isExpanded ? <CaretDown size={14} /> : <CaretRight size={14} />}
          </button>
        ) : (
          <div className="w-[14px]" />
        )}

        <div className="text-muted-foreground">
          <Tree size={16} />
        </div>

        <span className="flex-1 text-sm font-medium">{node.type}</span>

        <Badge variant="outline" className="text-xs">
          {node.order}
        </Badge>

        {componentDef?.allowsChildren && (
          <Badge variant="secondary" className="text-[10px]">
            Children
          </Badge>
        )}

        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(event) => {
              event.stopPropagation()
              onConfig(node.id)
            }}
          >
            <GearSix size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(node.id)
            }}
          >
            <Trash size={14} />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-4 border-l border-border pl-2">
          {node.childIds
            .sort((a, b) => hierarchy[a].order - hierarchy[b].order)
            .map((childId) => (
              <TreeNode
                key={childId}
                node={hierarchy[childId]}
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
      )}
    </div>
  )
}
