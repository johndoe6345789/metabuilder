/**
 * Component catalog for registering and retrieving components
 */

export interface ComponentCatalogEntry {
  name: string
  component: React.ComponentType
  description?: string
}

/**
 * Component catalog registry
 */
export class ComponentCatalog {
  private readonly components = new Map<string, ComponentCatalogEntry>()

  register(name: string, entry: ComponentCatalogEntry): void {
    this.components.set(name, entry)
  }

  get(name: string): ComponentCatalogEntry | undefined {
    return this.components.get(name)
  }

  getAll(): ComponentCatalogEntry[] {
    return Array.from(this.components.values())
  }
}

// Singleton instance
export const componentCatalog = new ComponentCatalog()
