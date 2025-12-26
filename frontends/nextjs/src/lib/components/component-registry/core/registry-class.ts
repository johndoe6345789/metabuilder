import type { ComponentTypeDefinition } from './types'
import { createComponentRegistryState } from './registry-state'
import { getAllComponents } from './get-all-components'
import { getComponent } from './get-component'
import { getComponentsByCategory } from './get-components-by-category'
import { hasComponent } from './has-component'
import { loadFromCatalog } from './load-from-catalog'
import { registerComponent } from './register-component'
import { registerComponents } from './register-components'

export class ComponentRegistry {
  private state = createComponentRegistryState()

  constructor() {
    loadFromCatalog(this.state)
  }

  registerComponent(component: ComponentTypeDefinition): void {
    registerComponent(this.state, component)
  }

  registerComponents(components: ComponentTypeDefinition[]): void {
    registerComponents(this.state, components)
  }

  getComponent(type: string): ComponentTypeDefinition | undefined {
    return getComponent(this.state, type)
  }

  getAllComponents(): ComponentTypeDefinition[] {
    return getAllComponents(this.state)
  }

  getComponentsByCategory(category: string): ComponentTypeDefinition[] {
    return getComponentsByCategory(this.state, category)
  }

  hasComponent(type: string): boolean {
    return hasComponent(this.state, type)
  }
}
