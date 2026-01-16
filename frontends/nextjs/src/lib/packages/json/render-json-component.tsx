/**
 * JSON Component Renderer for Next.js
 *
 * Renders JSON component definitions to React elements
 */

'use client'

import React from 'react'
import type { JSONComponent } from './types'
import type { JsonValue } from '@/types/utility-types'
import { FAKEMUI_REGISTRY } from '@/lib/fakemui-registry'

export interface RenderContext {
  props: Record<string, JsonValue>
  state: Record<string, JsonValue>
  [key: string]: JsonValue
}

/**
 * Render a JSON component definition to React
 *
 * By default, uses the FAKEMUI_REGISTRY to render components.
 * Pass a custom ComponentRegistry to override specific components.
 * Pass allComponents to enable $ref resolution within the same package.
 */
export function renderJSONComponent(
  component: JSONComponent,
  props: Record<string, JsonValue> = {},
  ComponentRegistry: Record<string, React.ComponentType<Record<string, unknown>>> = FAKEMUI_REGISTRY,
  allComponents?: JSONComponent[]
): React.ReactElement {
  if (component.render === undefined) {
    return (
      <div style={{ padding: '1rem', border: '1px solid red', borderRadius: '0.25rem' }}>
        <strong>Error:</strong> Component {component.name} has no render definition
      </div>
    )
  }

  // Build component registry for $ref resolution
  const componentRegistry = allComponents
    ? new Map(allComponents.map(c => [c.id, c]))
    : undefined

  const context: RenderContext = {
    props,
    state: {},
  }

  try {
    const template = component.render.template
    if (template === undefined) {
      return (
        <div style={{ padding: '1rem', border: '1px solid yellow', borderRadius: '0.25rem' }}>
          <strong>Warning:</strong> Component {component.name} has no template
        </div>
      )
    }
    return renderTemplate(template, context, ComponentRegistry, componentRegistry)
  } catch (error) {
    return (
      <div style={{ padding: '1rem', border: '1px solid red', borderRadius: '0.25rem' }}>
        <strong>Error rendering {component.name}:</strong>{' '}
        {error instanceof Error ? error.message : String(error)}
      </div>
    )
  }
}

/**
 * Render a template node to React
 */
function renderTemplate(
  node: JsonValue,
  context: RenderContext,
  ComponentRegistry: Record<string, React.ComponentType<Record<string, unknown>>>,
  componentRegistry?: Map<string, JSONComponent>
): React.ReactElement {
  if (node === null || typeof node !== 'object') {
    return <>{String(node)}</>
  }

  // Array case - should not happen at this level but handle gracefully
  if (Array.isArray(node)) {
    return <>{node.map(String).join(', ')}</>
  }

  // Now TypeScript knows it's a JsonObject (non-array object)
  const nodeObj = node as Record<string, JsonValue>

  // Handle $ref to other components in the same package
  if (typeof nodeObj.$ref === 'string' && componentRegistry !== undefined) {
    const referencedComponent = componentRegistry.get(nodeObj.$ref)
    if (referencedComponent !== undefined && referencedComponent.render?.template !== undefined) {
      return renderTemplate(referencedComponent.render.template, context, ComponentRegistry, componentRegistry)
    } else {
      return (
        <div style={{ padding: '0.5rem', border: '1px dashed orange', borderRadius: '0.25rem' }}>
          <strong>Warning:</strong> Component reference "${nodeObj.$ref}" not found
        </div>
      )
    }
  }

  // Handle conditional rendering
  if (nodeObj.type === 'conditional') {
    const conditionValue = nodeObj.condition
    if (conditionValue === null || conditionValue === undefined) {
      return <></>
    }
    const condition = evaluateExpression(conditionValue, context)
    const conditionIsTrue = condition !== null && condition !== undefined && condition !== false && condition !== 0 && condition !== ''
    if (conditionIsTrue && nodeObj.then !== null && nodeObj.then !== undefined) {
      return renderTemplate(nodeObj.then, context, ComponentRegistry, componentRegistry)
    } else if (!conditionIsTrue && nodeObj.else !== null && nodeObj.else !== undefined) {
      return renderTemplate(nodeObj.else, context, ComponentRegistry, componentRegistry)
    }
    return <></>
  }

  // Handle component references from registry
  const nodeType = nodeObj.type
  if (typeof nodeType === 'string' && (nodeType === 'component' || (ComponentRegistry[nodeType] !== undefined))) {
    const Component = ComponentRegistry[nodeType]
    if (Component !== undefined) {
      const componentProps: Record<string, JsonValue> = {}

      // Process props
      const props = nodeObj.props
      if (props !== null && props !== undefined && typeof props === 'object' && !Array.isArray(props)) {
        for (const [key, value] of Object.entries(props)) {
          const evaluated = evaluateExpression(value, context)
          if (evaluated !== undefined) {
            componentProps[key] = evaluated
          }
        }
      }

      // Process children
      let children: React.ReactNode = null
      const nodeChildren = nodeObj.children
      if (nodeChildren !== null && nodeChildren !== undefined) {
        if (typeof nodeChildren === 'string') {
          children = evaluateExpression(nodeChildren, context) as React.ReactNode
        } else if (Array.isArray(nodeChildren)) {
          children = nodeChildren.map((child: JsonValue, index: number) => {
            if (typeof child === 'string') {
              return evaluateExpression(child, context) as React.ReactNode
            }
            return (
              <React.Fragment key={index}>
                {renderTemplate(child, context, ComponentRegistry, componentRegistry)}
              </React.Fragment>
            )
          })
        } else {
          children = renderTemplate(nodeChildren, context, ComponentRegistry, componentRegistry)
        }
      }

      return <Component {...(componentProps as Record<string, unknown>)}>{children}</Component>
    }
  }

  // Map JSON element types to HTML elements
  const ElementType = getElementType(typeof nodeType === 'string' ? nodeType : 'div')

  // Build props
  const elementProps: Record<string, JsonValue> = {}

  if (nodeObj.className !== null && nodeObj.className !== undefined) {
    elementProps.className = nodeObj.className
  }

  if (nodeObj.style !== null && nodeObj.style !== undefined) {
    elementProps.style = nodeObj.style
  }

  if (nodeObj.href !== null && nodeObj.href !== undefined) {
    const href = evaluateExpression(nodeObj.href, context)
    if (href !== undefined) {
      elementProps.href = href
    }
  }

  if (nodeObj.src !== null && nodeObj.src !== undefined) {
    const src = evaluateExpression(nodeObj.src, context)
    if (src !== undefined) {
      elementProps.src = src
    }
  }

  if (nodeObj.alt !== null && nodeObj.alt !== undefined) {
    const alt = evaluateExpression(nodeObj.alt, context)
    if (alt !== undefined) {
      elementProps.alt = alt
    }
  }

  // Render children
  let children: React.ReactNode = null
  const nodeChildren = nodeObj.children
  if (nodeChildren !== null && nodeChildren !== undefined) {
    if (typeof nodeChildren === 'string') {
      children = evaluateExpression(nodeChildren, context) as React.ReactNode
    } else if (Array.isArray(nodeChildren)) {
      children = nodeChildren.map((child: JsonValue, index: number) => {
        if (typeof child === 'string') {
          return evaluateExpression(child, context) as React.ReactNode
        }
        return (
          <React.Fragment key={index}>
            {renderTemplate(child, context, ComponentRegistry, componentRegistry)}
          </React.Fragment>
        )
      })
    } else {
      children = renderTemplate(nodeChildren, context, ComponentRegistry, componentRegistry)
    }
  }

  return React.createElement(ElementType, elementProps, children)
}

/**
 * Map JSON component types to HTML element types
 */
function getElementType(type: string): string {
  const typeMap: Record<string, string> = {
    Box: 'div',
    Stack: 'div',
    Text: 'span',
    Button: 'button',
    Link: 'a',
    List: 'ul',
    ListItem: 'li',
    Icon: 'span',
    Avatar: 'div',
    Badge: 'div',
    Divider: 'hr',
    Breadcrumbs: 'nav',
  }

  return typeMap[type] ?? type
}

/**
 * Evaluate template expressions like {{variable}}
 */
function evaluateExpression(expr: JsonValue, context: RenderContext): JsonValue | undefined {
  if (typeof expr !== 'string') {
    return expr
  }

  // Length limit to prevent ReDoS attacks
  if (expr.length > 1000) {
    return expr
  }

  // Check if it's a template expression using non-greedy match
  const templateMatch = expr.match(/^\{\{(.+?)\}\}$/)
  const matchedExpression = templateMatch?.[1]
  if (matchedExpression !== undefined && matchedExpression.length > 0) {
    const expression = matchedExpression.trim()
    try {
      return evaluateSimpleExpression(expression, context)
    } catch {
      // Silently return original expression on evaluation failure
      return expr
    }
  }

  return expr
}

/**
 * Evaluate simple expressions (no arbitrary code execution)
 */
function evaluateSimpleExpression(expr: string, context: RenderContext): JsonValue | undefined {
  // Handle property access like "props.title"
  const parts = expr.split('.')
  let value: JsonValue | undefined = context

  for (const part of parts) {
    // Handle ternary operator
    if (part.includes('?')) {
      const [condition, branches] = part.split('?')
      if (condition === undefined || condition.length === 0 || branches === undefined || branches.length === 0) {
        return value
      }
      const [trueBranch, falseBranch] = branches.split(':')
      if (trueBranch === undefined || trueBranch.length === 0 || falseBranch === undefined || falseBranch.length === 0) {
        return value
      }
      const conditionValue = evaluateSimpleExpression(condition.trim(), context)
      const isTrue = conditionValue !== null && conditionValue !== undefined && conditionValue !== false && conditionValue !== 0 && conditionValue !== ''
      return isTrue
        ? evaluateSimpleExpression(trueBranch.trim(), context)
        : evaluateSimpleExpression(falseBranch.trim(), context)
    }

    // Handle negation
    if (part.startsWith('!')) {
      const innerPart = part.substring(1)
      if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)) {
        value = (value as Record<string, JsonValue>)[innerPart]
      }
      return value === null || value === undefined || value === false || value === 0 || value === '' ? true : false
    }

    // Handle array access or simple property
    if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)) {
      value = (value as Record<string, JsonValue>)[part]
    } else {
      return undefined
    }
  }

  return value
}
