import { getAllComponents } from '../getters/get-all-components'
import { getComponent } from '../getters/get-component'
import { getComponentsByCategory } from '../getters/get-components-by-category'
import { hasComponent } from '../getters/has-component'
import { loadFromCatalog } from '../register/load-from-catalog'
import { registerComponent } from '../register/register-component'
import { registerComponents } from '../register/register-components'
import { createComponentRegistryState } from './registry-state'
import type { ComponentTypeDefinition } from './types'

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
