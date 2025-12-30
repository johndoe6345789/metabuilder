import React, { useEffect, useId } from 'react'

/**
 * GlobalStyles - Inject global CSS styles
 * Similar to MUI's GlobalStyles component
 */
export function GlobalStyles({ styles }) {
  const id = useId()

  useEffect(() => {
    if (!styles) return

    // Convert styles object to CSS string
    let cssText = ''
    
    if (typeof styles === 'string') {
      cssText = styles
    } else if (typeof styles === 'object') {
      cssText = objectToCss(styles)
    } else if (typeof styles === 'function') {
      // If styles is a function, call it (for theme support)
      const result = styles({})
      cssText = typeof result === 'string' ? result : objectToCss(result)
    }

    // Create style element
    const styleElement = document.createElement('style')
    styleElement.id = `fakemui-global-styles-${id}`
    styleElement.textContent = cssText
    document.head.appendChild(styleElement)

    return () => {
      const element = document.getElementById(`fakemui-global-styles-${id}`)
      if (element) {
        element.remove()
      }
    }
  }, [styles, id])

  return null
}

/**
 * Convert a styles object to CSS string
 */
function objectToCss(obj, selector = '') {
  let css = ''

  for (const [key, value] of Object.entries(obj)) {
    if (value == null) continue

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Nested selector
      const newSelector = key.startsWith('@')
        ? key // Media queries, etc.
        : selector
          ? `${selector} ${key}`
          : key

      if (key.startsWith('@')) {
        css += `${key} {\n${objectToCss(value, selector)}\n}\n`
      } else {
        css += objectToCss(value, newSelector)
      }
    } else {
      // CSS property
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      const cssValue = typeof value === 'number' && !unitlessProperties.has(key)
        ? `${value}px`
        : value

      if (selector) {
        css += `${selector} { ${cssKey}: ${cssValue}; }\n`
      } else {
        css += `${cssKey}: ${cssValue};\n`
      }
    }
  }

  return css
}

// Properties that don't need 'px' suffix
const unitlessProperties = new Set([
  'animationIterationCount',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridArea',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
])

export default GlobalStyles
