import { UIComponent } from '@/types/json-ui'
import { ComponentDefinition } from '@/lib/component-definition-types'

export interface SchemaEditorLayoutProps {
  components: UIComponent[]
  selectedId: string | null
  hoveredId: string | null
  draggedOverId: string | null
  dropPosition: 'before' | 'after' | 'inside' | null
  selectedComponent: UIComponent | null
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
  onHoverEnd: () => void
  onComponentDragStart: (component: ComponentDefinition, e: React.DragEvent) => void
  onTreeDragStart: (id: string, e: React.DragEvent) => void
  onDragOver: (id: string, e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (targetId: string, e: React.DragEvent) => void
  onUpdate: (updates: Partial<UIComponent>) => void
  onDelete: () => void
  onImport: () => void
  onExport: () => void
  onCopy: () => void
  onPreview: () => void
  onClear: () => void
}
