import React from 'react'
import type { JSONUIRendererProps } from './types'
import { getUIComponent } from './component-registry'
import {
  useRenderDepth,
  DepthLimitFallback,
  trackRender,
} from './render-depth'
import {
  resolveProps,
  applyEventHandlers,
} from './renderer-props'
import { renderLoop } from './renderer-loop'
import {
  makeRenderNode,
  makeRenderChildren,
  makeRenderBranch,
  renderElement,
  missingComponent,
} from './renderer-utils'
import { renderItemTemplate } from './renderer-item-template'
import {
  evalCondition,
  evalConditional,
} from './renderer-conditional'

// Re-export form renderer so callers don't need to update imports
export { JSONFormRenderer } from './renderer-form'

export function JSONUIRenderer({
  component,
  dataMap = {},
  onAction,
  context = {},
}: JSONUIRendererProps) {
  const { exceeded, DepthProvider } = useRenderDepth()

  if (trackRender()) return null
  if (exceeded) {
    return <DepthLimitFallback componentId={component.id} />
  }

  const renderNode = makeRenderNode(
    JSONUIRenderer, DepthProvider, dataMap, onAction
  )
  const renderChildren = makeRenderChildren(renderNode)
  const renderBranch = makeRenderBranch(renderNode)
  const missing = (type: string) =>
    missingComponent(type, component.id)

  if (component.loop) {
    return renderLoop({
      component, dataMap, context,
      getComponent: getUIComponent, onAction,
      renderChildren, renderBranch,
      renderElement, missingComponent: missing,
      DepthProvider, JSONUIRenderer,
    })
  }

  if (!evalCondition(component, dataMap, context)) {
    return null
  }

  const condResult = evalConditional(
    component, dataMap, context, renderBranch
  )
  if (condResult !== 'continue') return condResult

  const Component = getUIComponent(component.type)
  if (!Component) return missing(component.type)

  const props = resolveProps(component, dataMap, context)
  applyEventHandlers(
    component, props, dataMap, context, onAction
  )

  if (component.itemTemplate) {
    return renderItemTemplate({
      component, ComponentClass: Component, props,
      dataMap, context, onAction,
      DepthProvider, JSONUIRenderer,
    })
  }

  return renderElement(
    Component, props,
    renderChildren(component.children, context)
  )
}
