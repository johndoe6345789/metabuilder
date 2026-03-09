'use client';
import { createElement, Fragment } from 'react';
import Link from 'next/link';

/**
 * JSON-to-React Renderer
 * Interprets declarative component definitions and renders them using fakemui classes
 */

// Element type mappings to HTML/React elements
const TYPE_MAP = {
  Box: 'div',
  Container: 'div',
  Stack: 'div',
  Grid: 'div',
  Text: 'span',
  Card: 'div',
  Button: 'button',
  Input: 'input',
  Form: 'form',
  Link: Link,
  Section: 'section',
  Nav: 'nav',
  Table: 'table',
  Thead: 'thead',
  Tbody: 'tbody',
  Tr: 'tr',
  Th: 'th',
  Td: 'td',
  Label: 'label',
  Select: 'select',
  Option: 'option',
  Chip: 'span',
  Alert: 'div',
  Code: 'code',
  Pre: 'pre',
};

// Class mappings based on component type and props
function getClasses(node) {
  const classes = [];
  const { type, variant, size, color, fullWidth, className } = node;

  if (className) classes.push(className);

  switch (type) {
    case 'Card':
      classes.push('card');
      break;
    case 'Button':
      classes.push('btn');
      if (variant === 'contained' || variant === 'primary') classes.push('btn--primary');
      else if (variant === 'outlined' || variant === 'outline') classes.push('btn--outline');
      else if (variant === 'ghost') classes.push('btn--ghost');
      if (size === 'small' || size === 'sm') classes.push('btn--sm');
      if (fullWidth) classes.push('btn--full-width');
      break;
    case 'Input':
      classes.push('input');
      if (fullWidth) classes.push('input--full-width');
      break;
    case 'Container':
      classes.push('container');
      break;
    case 'Grid':
      if (node.container) classes.push('grid');
      if (node.cols) classes.push(`grid-cols-${node.cols}`);
      break;
    case 'Stack':
      classes.push('stack');
      if (node.direction === 'row') classes.push('stack--row');
      break;
    case 'Chip':
      classes.push('chip');
      if (size === 'small' || size === 'sm') classes.push('chip--sm');
      if (variant === 'outline') classes.push('chip--outline');
      break;
    case 'Alert':
      classes.push('alert');
      if (variant) classes.push(`alert--${variant}`);
      break;
    case 'Text':
      if (variant === 'h1') classes.push('text-h1');
      else if (variant === 'h2') classes.push('text-h2');
      else if (variant === 'h3') classes.push('text-h3');
      else if (variant === 'body2') classes.push('text-body2');
      break;
    case 'Table':
      classes.push('table');
      break;
  }

  return classes.join(' ');
}

// Convert sx prop to inline styles (simplified)
function sxToStyle(sx) {
  if (!sx) return undefined;
  const style = {};
  const map = {
    p: 'padding', px: 'paddingInline', py: 'paddingBlock',
    m: 'margin', mx: 'marginInline', my: 'marginBlock',
    mt: 'marginTop', mb: 'marginBottom', ml: 'marginLeft', mr: 'marginRight',
    pt: 'paddingTop', pb: 'paddingBottom', pl: 'paddingLeft', pr: 'paddingRight',
    gap: 'gap', display: 'display', flexDirection: 'flexDirection',
    justifyContent: 'justifyContent', alignItems: 'alignItems',
    textAlign: 'textAlign', fontSize: 'fontSize', fontWeight: 'fontWeight',
    color: 'color', background: 'background', bgcolor: 'backgroundColor',
    width: 'width', height: 'height', maxWidth: 'maxWidth', minHeight: 'minHeight',
    borderRadius: 'borderRadius', overflow: 'overflow',
  };
  for (const [key, val] of Object.entries(sx)) {
    const cssProp = map[key] || key;
    // Handle spacing values (multiply by 8 for rem-like spacing)
    style[cssProp] = typeof val === 'number' && ['p', 'px', 'py', 'm', 'mx', 'my', 'mt', 'mb', 'ml', 'mr', 'pt', 'pb', 'pl', 'pr', 'gap'].includes(key)
      ? `${val * 8}px` : val;
  }
  return style;
}

// Interpolate template variables like {{title}} or {namespace}
function interpolate(str, context) {
  if (typeof str !== 'string') return str;
  return str.replace(/\{\{?(\w+)\}?\}/g, (_, key) => context[key] ?? '');
}

// Render a single node
function renderNode(node, context = {}, key) {
  if (!node) return null;
  if (typeof node === 'string') return interpolate(node, context);
  if (Array.isArray(node)) return node.map((n, i) => renderNode(n, context, i));

  // Handle $ref for component composition
  if (node.$ref && context.$components) {
    const refComponent = context.$components[node.$ref];
    if (refComponent) return renderNode(refComponent.render?.template || refComponent, context, key);
  }

  const { type, children, onClick, href, ...rest } = node;
  const Element = TYPE_MAP[type] || type || 'div';
  const className = getClasses(node);
  const style = sxToStyle(node.sx);

  // Build props
  const props = { key, className: className || undefined, style };

  // Handle specific props
  if (href) props.href = interpolate(href, context);
  if (onClick && typeof context[onClick] === 'function') props.onClick = context[onClick];
  if (rest.placeholder) props.placeholder = interpolate(rest.placeholder, context);
  if (rest.value !== undefined) props.value = rest.value;
  if (rest.name) props.name = rest.name;
  if (rest.required) props.required = true;
  if (rest.disabled) props.disabled = true;
  if (rest.type) props.type = rest.type;
  if (rest.id) props.id = rest.id;
  if (rest.htmlFor) props.htmlFor = rest.htmlFor;
  if (rest.pattern) props.pattern = rest.pattern;

  // Render children
  const renderedChildren = children
    ? (Array.isArray(children)
      ? children.map((c, i) => renderNode(c, context, i))
      : renderNode(children, context))
    : undefined;

  return createElement(Element, props, renderedChildren);
}

// Main Renderer component
export function Renderer({ definition, context = {} }) {
  if (!definition) return null;

  // Build component lookup for $ref resolution
  const $components = {};
  if (definition.components) {
    definition.components.forEach(c => { $components[c.id] = c; });
  }

  const rootComponent = definition.components?.find(c => c.id === definition.root) || definition.components?.[0];
  if (!rootComponent) return null;

  return renderNode(rootComponent.render?.template || rootComponent, { ...context, $components });
}

// Hook for using renderer with state
export function useRenderer(definition) {
  return { Renderer, definition };
}

export default Renderer;
