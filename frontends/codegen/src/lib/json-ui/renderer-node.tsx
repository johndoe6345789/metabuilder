'use client'

/**
 * renderer-node.tsx
 *
 * Handles renderWithContext (single-node rendering) for JSONUIRenderer.
 * Kept separate so renderer.tsx and renderer-loop.tsx stay under 100 LOC.
 */

import React from 'react'
import type { UIComponent } from './types'
import { getUIComponent } from './component-registry'
import { resolveDataBinding } from './utils'
import { evaluateConditionExpression } from './expression-helpers'
import { cn } from '@/lib/utils'
import {
  warnedComponentTypes,
  collectEventHandlers,
  getEventPropName,
  sanitizeDomProps,
} from './renderer-helpers'
import {
  useRenderDepth,
  DepthLimitFallback,
} from './render-depth'
import { JSONUIRenderer } from './renderer'

interface RenderNodeArgs {
  component: UIComponent
  dataMap: Record<string, unknown>
  onAction?: (
    actions: any[],
    event?: any
  ) => void
  context: Record<string, unknown>
}

export function renderWithContext({
  component,
  dataMap,
  onAction,
  context,
}: RenderNodeArgs): React.ReactNode {
  const { DepthProvider } = useRenderDepth()

  const renderChildren = (
    children: UIComponent[] | string | undefined,
    ctx: Record<string, unknown>
  ): React.ReactNode => {
    if (!children) return null
    if (typeof children === 'string') return children
    return children.map((child, i) => (
      <React.Fragment key={child.id || `child-${i}`}>
        <DepthProvider>
          <JSONUIRenderer
            component={child}
            dataMap={dataMap}
            onAction={onAction}
            context={ctx}
          />
        </DepthProvider>
      </React.Fragment>
    ))
  }

  if (component.condition) {
    const visible =
      typeof component.condition === 'string'
        ? evaluateConditionExpression(
            component.condition,
            { ...dataMap, ...context },
            { label: `condition (${component.id})` }
          )
        : resolveDataBinding(
            component.condition,
            dataMap,
            context
          )
    if (!visible) return null
  }

  const Component = getUIComponent(component.type)

  if (!Component) {
    if (!warnedComponentTypes.has(component.type)) {
      warnedComponentTypes.add(component.type)
      console.warn(
        `[JSON-UI] Component type "${component.type}" not found` +
        ` in registry (id: ${component.id})`
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
          Missing: {component.type} ({component.id})
        </div>
      )
    }
    return null
  }

  const props: Record<string, any> = { ...component.props }

  if (component.bindings) {
    Object.entries(
      component.bindings as Record<string, any>
    ).forEach(([propName, binding]) => {
      props[propName] = resolveDataBinding(
        binding,
        dataMap,
        context
      )
    })
  }

  if (component.dataBinding) {
    const bound = resolveDataBinding(
      component.dataBinding,
      dataMap,
      context
    )
    if (bound !== undefined) {
      props.value = bound
      props.data = bound
    }
  }

  if (component.className) {
    props.className = cn(props.className, component.className)
  }
  if (component.style) {
    props.style = { ...props.style, ...component.style }
  }

  const handlers = collectEventHandlers(component.events as any)
  handlers.forEach((handler) => {
    const propName = getEventPropName(handler.event)
    props[propName] = (ev?: any) => {
      if (handler.condition) {
        const met = evaluateConditionExpression(
          handler.condition,
          { ...dataMap, ...context },
          { label: 'event handler condition' }
        )
        if (!met) return
      }
      const payload =
        typeof ev === 'object' && ev !== null
          ? { ...ev, ...context }
          : ev
      onAction?.(handler.actions, payload)
    }
  })

  const rendered = renderChildren(component.children, context)

  if (typeof Component === 'string') {
    const domProps = { ...props }
    sanitizeDomProps(domProps)
    if (
      'value' in domProps &&
      typeof domProps.onChange !== 'function'
    ) {
      domProps.defaultValue = domProps.value
      delete domProps.value
    }
    if (rendered !== null) {
      return React.createElement(Component, domProps, rendered)
    }
    return React.createElement(Component, domProps)
  }

  if (rendered !== null) {
    return <Component {...props}>{rendered}</Component>
  }
  return <Component {...props} />
}
