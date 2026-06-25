/**
 * Explicitly registered sub-components (Turbopack workaround).
 * Split: component-registry-subcomponents-a.ts (UI tools)
 *         component-registry-subcomponents-b.ts (atomic library)
 */
import type { UIComponentRegistry } from './component-registry-types'
import { uiToolsSubComponents } from
  './component-registry-subcomponents-a'
import { atomicLibrarySubComponents } from
  './component-registry-subcomponents-b'

export const componentTreeSubComponents: UIComponentRegistry = {
  ...uiToolsSubComponents,
  ...atomicLibrarySubComponents,
}
