import type React from 'react'
import type { JsonValue } from '@/types/utility-types'
import type { JSONComponent } from '../types'
import type { RenderContext } from '../render-json-component'
import {
  renderConditional,
  renderElement,
  renderRef,
  renderRegistryComponent,
} from './render-branches'

type Registry = Record<string, React.ComponentType<Record<string, unknown>>>

/** Render one JSON template node to a React element -- the recursive
 *  core `renderJSONComponent` bootstraps into. Each shape of node
 *  ($ref, conditional, registry component, plain element) is one
 *  function in render-branches.ts. */
export function renderTemplate(
  node: JsonValue,
  context: RenderContext,
  registry: Registry,
  componentRegistry?: Map<string, JSONComponent>
): React.ReactElement {
  const render = (n: JsonValue, ctx: RenderContext): React.ReactElement =>
    renderTemplate(n, ctx, registry, componentRegistry)

  if (node === null || typeof node !== 'object') {
    return <>{String(node)}</>
  }
  if (Array.isArray(node)) {
    return <>{node.map(String).join(', ')}</>
  }

  const nodeObj = node as Record<string, JsonValue>

  if (typeof nodeObj.$ref === 'string' && componentRegistry !== undefined) {
    return renderRef(nodeObj.$ref, context, componentRegistry, render)
  }

  if (nodeObj.type === 'conditional') {
    return renderConditional(nodeObj, context, render)
  }

  const nodeType = nodeObj.type
  if (typeof nodeType === 'string') {
    const Component = registry[nodeType]
    if (nodeType === 'component' || Component !== undefined) {
      if (Component !== undefined) {
        return renderRegistryComponent(Component, nodeObj, context, render)
      }
    }
  }

  return renderElement(nodeObj, nodeType, context, render)
}
