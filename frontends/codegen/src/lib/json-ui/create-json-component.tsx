import React, { createContext, useContext } from 'react'
import { JSONUIRenderer } from './renderer'
import { getUIComponent } from './component-registry'

/**
 * Context tracking active JSON definition IDs in the current render path.
 * Used to detect self-referencing component definitions that would cause
 * infinite recursion (e.g., a component whose JSON type resolves back to itself).
 */
export const ActiveJsonDefs = createContext<Set<string>>(new Set())

/**
 * Detect if a JSON definition is a "stub" — a simple pass-through to a
 * component type with no children, loop, or conditional logic.
 * Stubs should forward all React props directly to the resolved component
 * rather than going through JSONUIRenderer (which doesn't forward props).
 */
function isStubDefinition(def: any): boolean {
  if (!def || !def.type) return false
  // Has real children array → not a stub
  if (Array.isArray(def.children) && def.children.length > 0) return false
  // Has loop or conditional → not a stub
  if (def.loop || def.conditional) return false
  return true
}

/**
 * Creates a React component from a JSON definition
 * This eliminates the need for wrapper files - components are pure JSON
 */
export function createJsonComponent<TProps = any>(
  jsonDefinition: any
) {
  const defId = jsonDefinition?.id || jsonDefinition?.type || 'unknown'
  const isStub = isStubDefinition(jsonDefinition)

  return function JsonComponent(props: TProps) {
    const activeDefs = useContext(ActiveJsonDefs)

    if (activeDefs.has(defId)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[JSON-UI] Circular JSON definition detected: "${defId}". Breaking cycle.`
        )
      }
      return null
    }

    // Stub definitions: resolve the component type and render directly
    // with all React props forwarded. This avoids the JSONUIRenderer
    // path which doesn't forward props from dataMap to the component.
    if (isStub) {
      const Component = getUIComponent(jsonDefinition.type)
      if (!Component) return null
      return React.createElement(Component as any, props as any)
    }

    const nextDefs = new Set(activeDefs)
    nextDefs.add(defId)

    return (
      <ActiveJsonDefs.Provider value={nextDefs}>
        <JSONUIRenderer
          component={jsonDefinition}
          dataMap={props as Record<string, unknown>}
        />
      </ActiveJsonDefs.Provider>
    )
  }
}
