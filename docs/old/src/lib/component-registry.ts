import { componentCatalog } from './component-catalog'
import type { ComponentDefinition } from './builder-types'

export interface ComponentTypeDefinition extends ComponentDefinition {
  renderingLogic?: {
    type: 'shadcn' | 'declarative' | 'custom'
    componentName?: string
    customRenderer?: string
  }
}

export class ComponentRegistry {
  private components: Map<string, ComponentTypeDefinition> = new Map()

  constructor() {
    this.loadFromCatalog()
  }

  private loadFromCatalog(): void {
    componentCatalog.forEach(comp => {
      this.registerComponent(comp as ComponentTypeDefinition)
    })
  }

  registerComponent(component: ComponentTypeDefinition): void {
    this.components.set(component.type, component)
  }

  registerComponents(components: ComponentTypeDefinition[]): void {
    components.forEach(comp => this.registerComponent(comp))
  }

  getComponent(type: string): ComponentTypeDefinition | undefined {
    return this.components.get(type)
  }

  getAllComponents(): ComponentTypeDefinition[] {
    return Array.from(this.components.values())
  }

  getComponentsByCategory(category: string): ComponentTypeDefinition[] {
    return Array.from(this.components.values()).filter(
      comp => comp.category === category
    )
  }

  hasComponent(type: string): boolean {
    return this.components.has(type)
  }
}

let registryInstance: ComponentRegistry | null = null

export function getComponentRegistry(): ComponentRegistry {
  if (!registryInstance) {
    registryInstance = new ComponentRegistry()
  }
  return registryInstance
}

export async function initializeComponentRegistry(): Promise<void> {
  getComponentRegistry()
}
