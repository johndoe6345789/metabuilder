import { ComponentDefinition } from '@/lib/component-definition-types'

export interface SchemaEditorSidebarProps {
  onDragStart: (component: ComponentDefinition, e: React.DragEvent) => void
}
