import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@metabuilder/m3/surfaces'
import { Badge } from '@metabuilder/m3/data-display'
import { Separator } from '@metabuilder/m3/data-display'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Folder,
  Package,
  Stack,
} from '@metabuilder/m3/icons'
import componentTreeCopy from '@/data/component-tree-viewer.json'
import { ComponentTree } from '@/types/project'

type ComponentTreeCategory = 'molecule' | 'organism'

type ComponentTreeWithCategory = ComponentTree & {
  category?: ComponentTreeCategory
}

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString()

const getCategoryLabel = (
  category?: ComponentTreeCategory
) => {
  if (!category) return ''
  return (
    componentTreeCopy.categories[category] ?? category
  )
}

export function ComponentTreeList({
  trees,
  selectedTreeId,
  onSelect,
  variant,
}: {
  trees: ComponentTreeWithCategory[]
  selectedTreeId: string | null
  onSelect: (id: string) => void
  variant: 'molecules' | 'organisms' | 'all'
}) {
  return (
    <ScrollArea>
      <div>
        {trees.map((tree) => {
          const categoryLabel =
            variant === 'all'
              ? getCategoryLabel(tree.category)
              : ''
          const treeIcon =
            variant === 'molecules'
              ? 'molecule'
              : variant === 'organisms'
              ? 'organism'
              : tree.category

          return (
            <Card
              key={tree.id}
              onClick={() => onSelect(tree.id)}
            >
              <CardHeader>
                <CardTitle>
                  {treeIcon === 'molecule' ? (
                    <Package
                      size={18}
                      weight="duotone"
                    />
                  ) : (
                    <Stack
                      size={18}
                      weight="duotone"
                    />
                  )}
                  {tree.name}
                  {categoryLabel ? (
                    <Badge variant="outline">
                      {categoryLabel}
                    </Badge>
                  ) : null}
                </CardTitle>
                <CardDescription>
                  {tree.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <span>
                    {tree.rootNodes.length}{' '}
                    {
                      componentTreeCopy.labels
                        .rootNodes
                    }
                  </span>
                  <Separator
                    orientation="vertical"
                  />
                  <span>
                    {formatDate(tree.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}
