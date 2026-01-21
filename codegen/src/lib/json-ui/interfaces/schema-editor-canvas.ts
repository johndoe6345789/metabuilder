import { UIComponent } from '@/types/json-ui'

export interface SchemaEditorCanvasProps {
  components: UIComponent[]
  selectedId: string | null
  hoveredId: string | null
  draggedOverId: string | null
  dropPosition: 'before' | 'after' | 'inside' | null
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
  onHoverEnd: () => void
  onDragOver: (id: string, e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (targetId: string, e: React.DragEvent) => void
}
