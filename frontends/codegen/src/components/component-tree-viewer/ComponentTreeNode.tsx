import { Badge } from '@metabuilder/fakemui/data-display'
import componentTreeCopy from '@/data/component-tree-viewer.json'
import { ComponentNode } from '@/types/project'

export function ComponentTreeNode({
  node,
  depth = 0,
}: {
  node: ComponentNode
  depth?: number
}) {
  return (
    <div>
      <div style={{ marginLeft: `${depth * 16}px` }}>
        <div>
          <span>{node.name || node.type}</span>
          <Badge variant="secondary">
            {node.type}
          </Badge>
        </div>
        {Object.keys(node.props).length > 0 && (
          <div>
            {componentTreeCopy.labels.props}:{' '}
            {Object.keys(node.props).length}
          </div>
        )}
      </div>
      {node.children.map((child) => (
        <ComponentTreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}
