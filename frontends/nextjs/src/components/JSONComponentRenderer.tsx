'use client'

import { renderJSONComponent } from '@/lib/packages/json/render-json-component'
import type { JSONComponent } from '@/lib/packages/json/types'
import type { JsonValue } from '@/types/utility-types'

interface JSONComponentRendererProps {
  component: JSONComponent
  props?: Record<string, JsonValue>
  allComponents?: JSONComponent[]
}

/**
 * Client-side wrapper for rendering JSON components
 * This allows server components to pass JSON component definitions
 * that will be rendered on the client
 */
export function JSONComponentRenderer({
  component,
  props = {},
  allComponents,
}: JSONComponentRendererProps) {
  return renderJSONComponent(component, props, {}, allComponents)
}
