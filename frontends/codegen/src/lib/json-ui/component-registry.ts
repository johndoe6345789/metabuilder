/**
 * Component registry — resolves JSON component types to React components.
 *
 * Split into focused files for ≤100 LOC compliance.
 */
import { ComponentType } from 'react'
import {
  UIComponentRegistry,
  DeprecatedComponentInfo,
  resolveWrapperComponent,
  deprecatedComponentInfo,
} from './component-registry-types'
import {
  primitiveComponents,
  m3Components,
} from './component-registry-primitives'
import {
  m3ExplicitComponents,
  componentTreeSubComponents,
} from './component-registry-explicit'
import {
  atomContext,
  moleculeContext,
  organismContext,
  buildRegistryFromEntries,
} from './component-registry-loader'
import {
  resolveJsonComponent,
  resolveIconComponent,
} from './component-registry-resolvers'

export type { UIComponentRegistry, DeprecatedComponentInfo }

export const atomComponents: UIComponentRegistry =
  buildRegistryFromEntries('atoms', atomContext)
export const moleculeComponents: UIComponentRegistry =
  buildRegistryFromEntries('molecules', moleculeContext)
export const organismComponents: UIComponentRegistry =
  buildRegistryFromEntries('organisms', organismContext)
export const jsonWrapperComponents: UIComponentRegistry =
  buildRegistryFromEntries('wrappers', null)
export const iconComponents: UIComponentRegistry = {}
export const customComponents: UIComponentRegistry =
  buildRegistryFromEntries('custom', null)
export const componentsComponents: UIComponentRegistry =
  buildRegistryFromEntries('components', null)

export const uiComponentRegistry: UIComponentRegistry = {
  ...primitiveComponents,
  ...atomComponents,
  ...moleculeComponents,
  ...organismComponents,
  ...jsonWrapperComponents,
  ...iconComponents,
  ...customComponents,
  ...componentsComponents,
  ...componentTreeSubComponents,
  ...m3Components,
  ...m3ExplicitComponents,
}

export function registerComponent(
  name: string,
  component: ComponentType<any>,
) {
  uiComponentRegistry[name] = component
}

export function getUIComponent(
  type: string,
): ComponentType<any> | string | null {
  return (
    resolveWrapperComponent(type, uiComponentRegistry) ??
    uiComponentRegistry[type] ??
    resolveJsonComponent(type, uiComponentRegistry) ??
    resolveIconComponent(type, uiComponentRegistry) ??
    null
  )
}

export function hasComponent(type: string): boolean {
  return Boolean(
    resolveWrapperComponent(type, uiComponentRegistry) ??
      uiComponentRegistry[type] ??
      resolveJsonComponent(type, uiComponentRegistry) ??
      resolveIconComponent(type, uiComponentRegistry),
  )
}

export function getDeprecatedComponentInfo(
  type: string,
): DeprecatedComponentInfo | null {
  return deprecatedComponentInfo[type] ?? null
}
