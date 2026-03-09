import { UIComponent } from '@/types/json-ui'

export interface CanvasRendererProps {
  /**
   * Array of components to render on the canvas
   */
  components: UIComponent[]

  /**
   * ID of the currently selected component
   */
  selectedId: string | null

  /**
   * ID of the currently hovered component
   */
  hoveredId: string | null

  /**
   * ID of the component being dragged over
   */
  draggedOverId: string | null

  /**
   * Position where a drop will occur (before, after, or inside component)
   */
  dropPosition: 'before' | 'after' | 'inside' | null

  /**
   * Callback when a component is selected
   */
  onSelect: (id: string) => void

  /**
   * Callback when mouse enters a component
   */
  onHover: (id: string) => void

  /**
   * Callback when mouse leaves a component
   */
  onHoverEnd: () => void

  /**
   * Callback when dragging over a component
   */
  onDragOver: (id: string, e: React.DragEvent) => void

  /**
   * Callback when dragging leaves a component
   */
  onDragLeave: (e: React.DragEvent) => void

  /**
   * Callback when dropping on a component
   */
  onDrop: (id: string, e: React.DragEvent) => void
}
