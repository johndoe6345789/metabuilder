import type { JsonValue } from '@/types/utility-types'

/**
 * Component Types
 * Shared types for component hierarchy and config
 */

export interface ComponentNode {
  id: string
  type: string
  parentId?: string
  childIds: string[]
  order: number
  pageId: string
}

export interface ComponentConfig {
  id: string
  componentId: string
  props: Record<string, JsonValue>
  styles: Record<string, JsonValue>
  events: Record<string, string>
  conditionalRendering?: {
    condition: string
  }
}
