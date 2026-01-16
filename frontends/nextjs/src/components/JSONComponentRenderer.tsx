'use client'

import React from 'react'
import { renderJSONComponent } from '@/lib/packages/json/render-json-component'
import type { JSONComponent } from '@/lib/packages/json/types'

interface JSONComponentRendererProps {
  component: JSONComponent
  props?: Record<string, unknown>
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
