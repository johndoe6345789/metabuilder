/**
 * Generate React component tree from Lua UI component definitions
 * 
 * Transforms LuaUIComponent structures into React elements using
 * the JSON component renderer infrastructure.
 */

import React, { type ReactNode } from 'react'
import type { LuaUIComponent } from './types/lua-ui-package'

export interface ComponentTree {
  type: string
  props?: Record<string, unknown>
  children?: ComponentTree[]
}

/**
 * Map of basic HTML elements that can be rendered directly
 */
const HTML_ELEMENTS = new Set([
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'section', 'article', 'header', 'footer', 'main', 'aside', 'nav',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'form', 'input', 'button', 'select', 'option', 'textarea', 'label',
  'a', 'img', 'video', 'audio', 'canvas', 'svg',
  'strong', 'em', 'code', 'pre', 'blockquote',
])

/**
 * Render a single LuaUIComponent to a React element
 */
function renderComponent(component: LuaUIComponent, key?: string | number): ReactNode {
  const { type, props = {}, children } = component

  // Render children recursively
  const renderedChildren = children?.map((child, index) => 
    renderComponent(child, index)
  )

  // Handle text content
  if (type === 'text' && typeof props.content === 'string') {
    return props.content
  }

  // Handle HTML elements
  if (HTML_ELEMENTS.has(type)) {
    return React.createElement(
      type,
      { ...props, key },
      renderedChildren
    )
  }

  // Handle custom components - wrap in div with data attribute for future component registry
  return React.createElement(
    'div',
    { 
      'data-component': type,
      className: `component-${type}`,
      ...props,
      key,
    },
    renderedChildren ?? (
      <span className="component-placeholder">
        [{type}]
      </span>
    )
  )
}

/**
 * Generate a complete React component tree from a Lua UI component definition.
 * 
 * @param luaComponent - The root LuaUIComponent to render
 * @returns React node tree, or null if input is invalid
 */
export function generateComponentTree(luaComponent: unknown): ReactNode {
  // Validate input
  if (luaComponent === null || luaComponent === undefined) {
    return null
  }

  if (typeof luaComponent !== 'object') {
    return null
  }

  const component = luaComponent as LuaUIComponent

  // Must have a type to render
  if (typeof component.type !== 'string' || component.type.length === 0) {
    return (
      <div className="component-error">
        Invalid component: missing type
      </div>
    )
  }

  return renderComponent(component)
}
