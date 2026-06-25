import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { componentCatalog } from '@/lib/component-catalog'
import type { ComponentDefinition } from '@/lib/builder-types'
import * as PhosphorIcons from '@phosphor-icons/react'
import { MagnifyingGlass } from '@phosphor-icons/react'

interface ComponentCatalogProps {
  onDragStart: (component: ComponentDefinition) => void
}

export function ComponentCatalog({ onDragStart }: ComponentCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredComponents = componentCatalog.filter(comp =>
    comp.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = Array.from(new Set(componentCatalog.map(c => c.category)))

  const getIcon = (iconName: string) => {
    const Icon = (PhosphorIcons as any)[iconName]
    return Icon ? <Icon size={20} weight="duotone" /> : null
  }

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border h-screen">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-bold mb-3">Components</h2>
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/50" size={16} />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {categories.map(category => {
            const categoryComponents = filteredComponents.filter(c => c.category === category)
            if (categoryComponents.length === 0) return null

            return (
              <div key={category}>
                <h3 className="text-xs uppercase font-semibold text-sidebar-foreground/60 tracking-wider mb-3">
                  {category}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {categoryComponents.map(component => (
                    <Card
                      key={component.type}
                      className="p-3 cursor-grab active:cursor-grabbing hover:border-accent hover:shadow-md transition-all"
                      draggable
                      onDragStart={() => onDragStart(component)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="text-primary">
                          {getIcon(component.icon)}
                        </div>
                        <span className="text-xs font-medium">{component.label}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
