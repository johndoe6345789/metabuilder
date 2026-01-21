import { ComponentType } from 'react'
import { ComponentRegistry } from '@/lib/component-registry'

export function getComponent(name: string): ComponentType<any> | null {
  return ComponentRegistry[name] || null
}
