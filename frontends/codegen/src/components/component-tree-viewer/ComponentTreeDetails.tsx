import { Badge } from '@metabuilder/fakemui/data-display'
import { Separator } from '@metabuilder/fakemui/data-display'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TreeStructure } from '@metabuilder/fakemui/icons'
import componentTreeCopy from '@/data/component-tree-viewer.json'
import { ComponentTree } from '@/types/project'
import { ComponentTreeNode } from './ComponentTreeNode'

export function ComponentTreeDetails({
  tree,
}: {
  tree?: ComponentTree
}) {
  if (!tree) {
    return (
      <div>
        <div>
          <TreeStructure
            size={48}
            weight="duotone"
          />
          <p>
            {
              componentTreeCopy.status
                .selectPrompt
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ScrollArea>
        <div>
          <div>
            <h3>{tree.name}</h3>
            <p>{tree.description}</p>
            <div>
              <Badge variant="outline">
                {tree.rootNodes.length}{' '}
                {componentTreeCopy.labels.rootNodes}
              </Badge>
              <Badge variant="outline">
                {componentTreeCopy.labels.id}:{' '}
                {tree.id}
              </Badge>
            </div>
            <Separator />
          </div>
          <div>
            <h4>
              {
                componentTreeCopy.labels
                  .structureTitle
              }
            </h4>
            {tree.rootNodes.map((node) => (
              <ComponentTreeNode
                key={node.id}
                node={node}
              />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
