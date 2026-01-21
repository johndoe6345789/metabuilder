import { ComponentDefinition } from '@/lib/component-definition-types'

export interface ComponentPaletteItemProps {
  component: ComponentDefinition
  onDragStart: (component: ComponentDefinition, e: React.DragEvent) => void
  className?: string
}
