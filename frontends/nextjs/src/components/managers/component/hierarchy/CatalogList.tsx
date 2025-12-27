import { Plus, Tree } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui'
import { Separator } from '@/components/ui'
import { componentCatalog } from '@/lib/components/component-catalog'

type CatalogListProps = {
  selectedNodeId: string | null
  onAdd: (componentType: string, parentId?: string) => void
}

export function CatalogList({ selectedNodeId, onAdd }: CatalogListProps) {
  const categories = ['Layout', 'Input', 'Typography', 'Display', 'Feedback', 'Data']

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryComponents = componentCatalog.filter((component) => component.category === category)
          if (categoryComponents.length === 0) return null

          return (
            <div key={category}>
              <h3 className="font-semibold text-sm mb-2">{category}</h3>
              <Separator className="mb-3" />
              <div className="space-y-1">
                {categoryComponents.map((component) => (
                  <button
                    key={component.type}
                    onClick={() => onAdd(component.type, selectedNodeId || undefined)}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-accent transition-colors text-left"
                  >
                    <div className="text-muted-foreground">
                      <Tree size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{component.label}</div>
                      {component.allowsChildren && (
                        <div className="text-xs text-muted-foreground">Can contain children</div>
                      )}
                    </div>
                    <Plus size={16} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
