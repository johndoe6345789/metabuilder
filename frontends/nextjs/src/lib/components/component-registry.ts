/**
 * Component registry for managing component metadata
 */

export interface ComponentMetadata {
  id: string
  name: string
  type: string
  props?: Record<string, unknown>
}

/**
 * Component registry
 * TODO: Implement full component registry functionality
 */
export class ComponentRegistry {
  private readonly registry = new Map<string, ComponentMetadata>()

  register(id: string, metadata: ComponentMetadata): void {
    this.registry.set(id, metadata)
  }

  get(id: string): ComponentMetadata | undefined {
    return this.registry.get(id)
  }

  getAll(): ComponentMetadata[] {
    return Array.from(this.registry.values())
  }
}

// Singleton instance
export const componentRegistry = new ComponentRegistry()
