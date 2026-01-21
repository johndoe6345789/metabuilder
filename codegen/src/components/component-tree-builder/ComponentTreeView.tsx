import { ComponentNode } from '@/types/project'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CaretDown, CaretRight, Tree } from '@phosphor-icons/react'

interface ComponentTreeViewProps {
  nodes: ComponentNode[]
  selectedNodeId: string | null
  expandedNodes: Set<string>
  onSelectNode: (nodeId: string) => void
  onToggleExpand: (nodeId: string) => void
}

export function ComponentTreeView({
  nodes,
  selectedNodeId,
  expandedNodes,
  onSelectNode,
  onToggleExpand,
}: ComponentTreeViewProps) {
  const renderTreeNode = (node: ComponentNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedNodeId === node.id
    const hasChildren = node.children.length > 0

    return (
      <div key={node.id}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectNode(node.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelectNode(node.id)
            }
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors cursor-pointer ${
            isSelected
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-muted text-foreground'
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onToggleExpand(node.id)
              }}
              className="hover:text-accent"
              aria-label={isExpanded ? 'Collapse node' : 'Expand node'}
            >
              {isExpanded ? <CaretDown size={16} /> : <CaretRight size={16} />}
            </button>
          ) : (
            <div className="w-4" />
          )}
          <Tree size={16} />
          <span className="font-medium">{node.name}</span>
          <span className="text-muted-foreground text-xs ml-auto">
            {node.type}
          </span>
        </div>
        {isExpanded &&
          node.children.map((child) => renderTreeNode(child, level + 1))}
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 border rounded-lg">
      <div className="p-2 space-y-1">{nodes.map((node) => renderTreeNode(node))}</div>
    </ScrollArea>
  )
}
