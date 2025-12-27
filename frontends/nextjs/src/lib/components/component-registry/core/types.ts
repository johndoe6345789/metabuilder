import type { ComponentDefinition } from '../../types'

export interface ComponentTypeDefinition extends ComponentDefinition {
  renderingLogic?: {
    type: 'shadcn' | 'declarative' | 'custom'
    componentName?: string
    customRenderer?: string
  }
}
