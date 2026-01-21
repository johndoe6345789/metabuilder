import { UIComponent } from '@/types/json-ui'
import { ComponentTreeNode } from '@/components/atoms'

interface ComponentTreeNodesProps {
  components: UIComponent[]
  depth?: number
  expandedIds: Set<string>
  selectedId: string | null
  hoveredId: string | null
  draggedOverId: string | null
  dropPosition: 'before' | 'after' | 'inside' | null
  onSelect: (id: string) => void
  onHover: (id: string) => void
  onHoverEnd: () => void
  onDragStart: (id: string, e: React.DragEvent) => void
  onDragOver: (id: string, e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (id: string, e: React.DragEvent) => void
  onToggleExpand: (id: string) => void
}

export function ComponentTreeNodes({
  components,
  depth = 0,
  expandedIds,
  selectedId,
  hoveredId,
  draggedOverId,
  dropPosition,
  onSelect,
  onHover,
  onHoverEnd,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onToggleExpand,
}: ComponentTreeNodesProps) {
  return (
    <>
      {components.map((comp) => {
        const hasChildren = Array.isArray(comp.children) && comp.children.length > 0
        const isExpanded = expandedIds.has(comp.id)

        return (
          <div key={comp.id}>
            <ComponentTreeNode
              component={comp}
              isSelected={selectedId === comp.id}
              isHovered={hoveredId === comp.id}
              isDraggedOver={draggedOverId === comp.id}
              dropPosition={draggedOverId === comp.id ? dropPosition : null}
              onSelect={() => onSelect(comp.id)}
              onHover={() => onHover(comp.id)}
              onHoverEnd={onHoverEnd}
              onDragStart={(e) => onDragStart(comp.id, e)}
              onDragOver={(e) => onDragOver(comp.id, e)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(comp.id, e)}
              depth={depth}
              hasChildren={hasChildren}
              isExpanded={isExpanded}
              onToggleExpand={() => onToggleExpand(comp.id)}
            />
            {hasChildren && isExpanded && comp.children && (
              <div>
                <ComponentTreeNodes
                  components={comp.children}
                  depth={depth + 1}
                  expandedIds={expandedIds}
                  selectedId={selectedId}
                  hoveredId={hoveredId}
                  draggedOverId={draggedOverId}
                  dropPosition={dropPosition}
                  onSelect={onSelect}
                  onHover={onHover}
                  onHoverEnd={onHoverEnd}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onToggleExpand={onToggleExpand}
                />
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
