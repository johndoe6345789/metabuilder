import type { ComponentDefinition } from '../builder-types'

export interface ComponentTypeDefinition extends ComponentDefinition {
  renderingLogic?: {
    type: 'shadcn' | 'declarative' | 'custom'
    componentName?: string
    customRenderer?: string
  }
}
