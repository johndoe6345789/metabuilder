/**
 * renderer-missing.tsx
 *
 * "Missing component" warning and debug placeholder.
 */
import React from 'react'
import { warnedComponentTypes } from './renderer-helpers'

export function missingComponent(
  type: string,
  componentId: string
): React.ReactNode {
  if (!warnedComponentTypes.has(type)) {
    warnedComponentTypes.add(type)
    console.warn(
      `[JSON-UI] Component type "${type}" not found ` +
      `in registry (id: ${componentId})`
    )
  }
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div style={{
        border: '1px dashed #ef4444',
        padding: '4px 8px',
        margin: '2px',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#ef4444',
      }}>
        Missing: {type} ({componentId})
      </div>
    )
  }
  return null
}
