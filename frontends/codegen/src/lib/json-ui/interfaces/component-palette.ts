import { ComponentDefinition } from '@/lib/component-definition-types'

export interface ComponentPaletteProps {
  /**
   * Callback when a component drag starts
   */
  onDragStart: (component: ComponentDefinition, e: React.DragEvent) => void

  /**
   * Array of component categories
   */
  categories?: Array<{
    id: string
    label: string
  }>
}
