import { componentTreeConfig } from '@/components/molecules/component-tree/componentTreeConfig'
import { componentTreeIcons } from '@/components/molecules/component-tree/componentTreeIcons'

export function ComponentTreeEmptyState() {
  const Icon = componentTreeIcons[componentTreeConfig.icon as keyof typeof componentTreeIcons]

  return (
    <div className="p-8 text-center text-muted-foreground">
      <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p className="text-sm">{componentTreeConfig.emptyState.title}</p>
      <p className="text-xs mt-1">{componentTreeConfig.emptyState.description}</p>
    </div>
  )
}
