/**
 * JSON Component Renderer for Next.js
 *
 * Renders JSON component definitions to React elements
 */

import React from 'react'
import type { JSONComponent } from './types'
import type { JsonValue } from '@/types/utility-types'

export interface RenderContext {
  props: Record<string, JsonValue>
  state: Record<string, JsonValue>
  [key: string]: JsonValue
}

/**
 * Render a JSON component definition to React
 */
export function renderJSONComponent(
  component: JSONComponent,
  props: Record<string, JsonValue> = {},
  ComponentRegistry: Record<string, React.ComponentType<Record<string, JsonValue>>> = {}
): React.ReactElement {
  if (!component.render) {
    return (
      <div style={{ padding: '1rem', border: '1px solid red', borderRadius: '0.25rem' }}>
        <strong>Error:</strong> Component {component.name} has no render definition
      </div>
    )
  }

  const context: RenderContext = {
    props,
    state: {},
  }

  try {
    return renderTemplate(component.render.template, context, ComponentRegistry)
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
  ComponentRegistry: Record<string, React.ComponentType<Record<string, JsonValue>>>
): React.ReactElement {
  if (!node || typeof node !== 'object') {
    return <>{String(node)}</>
  }

  // Handle conditional rendering
  if (node.type === 'conditional') {
    const condition = evaluateExpression(node.condition, context)
    if (condition && node.then) {
      return renderTemplate(node.then, context, ComponentRegistry)
    } else if (!condition && node.else) {
      return renderTemplate(node.else, context, ComponentRegistry)
    }
    return <></>
  }

  // Handle component references from registry
  if (node.type === 'component' || ComponentRegistry[node.type]) {
    const Component = ComponentRegistry[node.type]
    if (Component) {
      const componentProps: Record<string, JsonValue> = {}

      // Process props
      if (node.props) {
        for (const [key, value] of Object.entries(node.props)) {
          componentProps[key] = evaluateExpression(value, context)
        }
      }

      // Process children
      let children: React.ReactNode = null
      if (node.children) {
        if (typeof node.children === 'string') {
          children = evaluateExpression(node.children, context)
        } else if (Array.isArray(node.children)) {
          children = node.children.map((child: JsonValue, index: number) => {
            if (typeof child === 'string') {
              return evaluateExpression(child, context)
            }
            return (
              <React.Fragment key={index}>
                {renderTemplate(child, context, ComponentRegistry)}
              </React.Fragment>
            )
          })
        } else {
          children = renderTemplate(node.children, context, ComponentRegistry)
        }
      }

      return <Component {...componentProps}>{children}</Component>
    }
  }

  // Map JSON element types to HTML elements
  const ElementType = getElementType(node.type)

  // Build props
  const elementProps: Record<string, JsonValue> = {}

  if (node.className) {
    elementProps.className = node.className
  }

  if (node.style) {
    elementProps.style = node.style
  }

  if (node.href) {
    elementProps.href = evaluateExpression(node.href, context)
  }

  if (node.src) {
    elementProps.src = evaluateExpression(node.src, context)
  }

  if (node.alt) {
    elementProps.alt = evaluateExpression(node.alt, context)
  }

  // Render children
  let children: React.ReactNode = null
  if (node.children) {
    if (typeof node.children === 'string') {
      children = evaluateExpression(node.children, context)
    } else if (Array.isArray(node.children)) {
      children = node.children.map((child: JsonValue, index: number) => {
        if (typeof child === 'string') {
          return evaluateExpression(child, context)
        }
        return (
          <React.Fragment key={index}>
            {renderTemplate(child, context, ComponentRegistry)}
          </React.Fragment>
        )
      })
    } else {
      children = renderTemplate(node.children, context, ComponentRegistry)
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

  return typeMap[type] || type
}

/**
 * Evaluate template expressions like {{variable}}
 */
function evaluateExpression(expr: JsonValue, context: RenderContext): JsonValue {
  if (typeof expr !== 'string') {
    return expr
  }

  // Check if it's a template expression
  const templateMatch = expr.match(/^\{\{(.+)\}\}$/)
  if (templateMatch) {
    const expression = templateMatch[1].trim()
    try {
      return evaluateSimpleExpression(expression, context)
    } catch (error) {
      console.warn(`Failed to evaluate expression: ${expression}`, error)
      return expr
    }
  }

  return expr
}

/**
 * Evaluate simple expressions (no arbitrary code execution)
 */
function evaluateSimpleExpression(expr: string, context: RenderContext): JsonValue {
  // Handle property access like "props.title"
  const parts = expr.split('.')
  let value: JsonValue = context

  for (const part of parts) {
    // Handle ternary operator
    if (part.includes('?')) {
      const [condition, branches] = part.split('?')
      const [trueBranch, falseBranch] = branches.split(':')
      const conditionValue = evaluateSimpleExpression(condition.trim(), context)
      return conditionValue
        ? evaluateSimpleExpression(trueBranch.trim(), context)
        : evaluateSimpleExpression(falseBranch.trim(), context)
    }

    // Handle negation
    if (part.startsWith('!')) {
      const innerPart = part.substring(1)
      value = value?.[innerPart]
      return !value
    }

    // Handle array access or simple property
    if (value && typeof value === 'object') {
      value = value[part]
    } else {
      return undefined
    }
  }

  return value
}
