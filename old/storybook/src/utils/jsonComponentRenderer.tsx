/**
 * JSON Component Renderer
 *
 * Renders JSON-defined components from the new package format
 */

import React from 'react'
import type { ComponentDefinition } from './packageDiscovery'

export interface RenderContext {
  [key: string]: any
}

/**
 * Render a JSON component definition to React elements
 */
export function renderJsonComponent(
  component: ComponentDefinition,
  props: Record<string, any> = {}
): React.ReactElement {
  if (!component.render) {
    return (
      <div className="error">
        <strong>Error:</strong> Component {component.name} has no render definition
      </div>
    )
  }

  const context: RenderContext = {
    props,
    state: {},
  }

  try {
    return renderTemplate(component.render.template, context)
  } catch (error) {
    return (
      <div className="error">
        <strong>Error rendering {component.name}:</strong>{' '}
        {error instanceof Error ? error.message : String(error)}
      </div>
    )
  }
}

/**
 * Render a template node to React
 */
function renderTemplate(node: any, context: RenderContext): React.ReactElement {
  if (!node || typeof node !== 'object') {
    return <>{String(node)}</>
  }

  // Handle conditional rendering
  if (node.type === 'conditional') {
    const condition = evaluateExpression(node.condition, context)
    if (condition && node.then) {
      return renderTemplate(node.then, context)
    } else if (!condition && node.else) {
      return renderTemplate(node.else, context)
    }
    return <></>
  }

  // Handle component references
  if (node.type === 'component') {
    return (
      <div className="component-placeholder" data-component={node.name}>
        [{node.name}]
      </div>
    )
  }

  // Map JSON element types to HTML elements
  const ElementType = getElementType(node.type)

  // Render children
  let children: React.ReactNode = null
  if (node.children) {
    if (typeof node.children === 'string') {
      children = evaluateExpression(node.children, context)
    } else if (Array.isArray(node.children)) {
      children = node.children.map((child: any, index: number) => {
        if (typeof child === 'string') {
          return evaluateExpression(child, context)
        }
        return <React.Fragment key={index}>{renderTemplate(child, context)}</React.Fragment>
      })
    } else {
      children = renderTemplate(node.children, context)
    }
  }

  // Build props
  const elementProps: Record<string, any> = {
    className: node.className,
  }

  // Add style
  if (node.style) {
    elementProps.style = node.style
  }

  // Add other props
  if (node.href) {
    elementProps.href = evaluateExpression(node.href, context)
  }
  if (node.src) {
    elementProps.src = evaluateExpression(node.src, context)
  }
  if (node.alt) {
    elementProps.alt = evaluateExpression(node.alt, context)
  }

  return <ElementType {...elementProps}>{children}</ElementType>
}

/**
 * Map JSON component types to HTML element types
 */
function getElementType(type: string): string | React.ComponentType {
  // Map common JSON types to HTML elements
  const typeMap: Record<string, string> = {
    Box: 'div',
    Stack: 'div',
    Text: 'span',
    Button: 'button',
    Link: 'a',
    List: 'ul',
    ListItem: 'li',
    ListItemButton: 'div',
    ListItemIcon: 'div',
    ListItemText: 'div',
    Icon: 'span',
    Avatar: 'div',
    Badge: 'div',
    Divider: 'hr',
    Collapse: 'div',
    Breadcrumbs: 'nav',
  }

  return typeMap[type] || type
}

/**
 * Evaluate template expressions like {{variable}}
 */
function evaluateExpression(expr: any, context: RenderContext): any {
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
function evaluateSimpleExpression(expr: string, context: RenderContext): any {
  // Handle property access like "props.title"
  const parts = expr.split('.')
  let value: any = context

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

/**
 * Create a story for a JSON component
 */
export function createComponentStory(
  component: ComponentDefinition,
  defaultProps: Record<string, any> = {}
) {
  return {
    render: (args: Record<string, any>) => {
      const mergedProps = { ...defaultProps, ...args }
      return renderJsonComponent(component, mergedProps)
    },
    args: defaultProps,
    argTypes: generateArgTypes(component),
  }
}

/**
 * Generate Storybook argTypes from component props
 */
function generateArgTypes(component: ComponentDefinition): Record<string, any> {
  if (!component.props) {
    return {}
  }

  const argTypes: Record<string, any> = {}

  for (const prop of component.props) {
    argTypes[prop.name] = {
      description: prop.description,
      control: getControlType(prop.type),
      defaultValue: prop.default,
    }

    if (prop.required === false) {
      argTypes[prop.name].table = {
        type: { summary: prop.type },
        defaultValue: { summary: prop.default },
      }
    }
  }

  return argTypes
}

/**
 * Get Storybook control type from prop type
 */
function getControlType(type: string): string {
  const controlMap: Record<string, string> = {
    string: 'text',
    number: 'number',
    boolean: 'boolean',
    array: 'object',
    object: 'object',
  }

  return controlMap[type] || 'text'
}
