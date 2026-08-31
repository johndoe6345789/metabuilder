/**
 * JSON Component Renderer for Next.js
 *
 * Renders JSON component definitions to React elements. By default, uses
 * the M3_REGISTRY to render components. Pass a custom ComponentRegistry to
 * override specific components, and allComponents to enable $ref
 * resolution within the same package.
 */

'use client'

import React from 'react'
import type { JSONComponent } from './types'
import type { JsonValue } from '@/types/utility-types'
import { M3_REGISTRY } from '@/lib/m3-registry'
import { renderTemplate } from './render-json-component/render-template'
import { Placeholder } from './render-json-component/error-placeholder'

export interface RenderContext {
  props: Record<string, JsonValue>
  state: Record<string, JsonValue>
  [key: string]: JsonValue
}

export function renderJSONComponent(
  component: JSONComponent,
  props: Record<string, JsonValue> = {},
  ComponentRegistry: Record<
    string,
    React.ComponentType<Record<string, unknown>>
  > = M3_REGISTRY,
  allComponents?: JSONComponent[]
): React.ReactElement {
  if (component.render === undefined) {
    return (
      <Placeholder tone="error">
        <strong>Error:</strong> Component {component.name} has no render
        definition
      </Placeholder>
    )
  }

  const componentRegistry = allComponents
    ? new Map(allComponents.map(c => [c.id, c]))
    : undefined
  const context: RenderContext = { props, state: {} }

  try {
    const template = component.render.template
    if (template === undefined) {
      return (
        <Placeholder tone="warning">
          <strong>Warning:</strong> Component {component.name} has no
          template
        </Placeholder>
      )
    }
    return renderTemplate(
      template,
      context,
      ComponentRegistry,
      componentRegistry
    )
  } catch (error) {
    return (
      <Placeholder tone="error">
        <strong>Error rendering {component.name}:</strong>{' '}
        {error instanceof Error ? error.message : String(error)}
      </Placeholder>
    )
  }
}
