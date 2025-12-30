import React, { forwardRef } from 'react'
import { useTheme } from './ThemeProvider'

/**
 * styled - Create styled components with CSS-in-JS
 * Similar to @mui/system styled or emotion's styled
 */
export function styled(Component, options = {}) {
  const { name, slot, shouldForwardProp = defaultShouldForwardProp } = options

  return function styledComponent(styles) {
    const StyledComponent = forwardRef(function StyledComponent(props, ref) {
      const theme = useTheme()
      const { sx, className, ...otherProps } = props

      // Filter props that shouldn't be forwarded to DOM
      const forwardedProps = {}
      const styleProps = {}
      
      Object.keys(otherProps).forEach((key) => {
        if (shouldForwardProp(key)) {
          forwardedProps[key] = otherProps[key]
        } else {
          styleProps[key] = otherProps[key]
        }
      })

      // Compute styles
      let computedStyles = {}
      
      if (typeof styles === 'function') {
        computedStyles = styles({ theme, ...styleProps })
      } else if (typeof styles === 'object') {
        computedStyles = styles
      }

      // Process sx prop
      let sxStyles = {}
      if (sx) {
        sxStyles = processSxProp(sx, theme)
      }

      // Merge styles
      const finalStyle = { ...computedStyles, ...sxStyles, ...props.style }

      // Generate class name
      const generatedClassName = name ? `Fakemui${name}${slot || '-root'}` : ''
      const combinedClassName = [generatedClassName, className].filter(Boolean).join(' ')

      // Check if Component is a string (HTML element) or React component
      const isHtmlElement = typeof Component === 'string'

      if (isHtmlElement) {
        return (
          <Component
            ref={ref}
            className={combinedClassName}
            style={finalStyle}
            {...forwardedProps}
          />
        )
      }

      return (
        <Component
          ref={ref}
          className={combinedClassName}
          style={finalStyle}
          {...forwardedProps}
          {...styleProps}
        />
      )
    })

    StyledComponent.displayName = name ? `Styled(${name})` : `Styled(${getDisplayName(Component)})`

    return StyledComponent
  }
}

/**
 * Process sx prop - converts MUI sx prop to inline styles
 */
export function processSxProp(sx, theme) {
  if (!sx) return {}

  const styles = {}

  // Handle array of sx objects
  if (Array.isArray(sx)) {
    return sx.reduce((acc, item) => {
      if (item) {
        return { ...acc, ...processSxProp(item, theme) }
      }
      return acc
    }, {})
  }

  // Handle function sx
  if (typeof sx === 'function') {
    return processSxProp(sx(theme), theme)
  }

  // Process each property
  Object.entries(sx).forEach(([key, value]) => {
    // Handle responsive values
    if (typeof value === 'object' && !Array.isArray(value)) {
      // Skip for now - responsive values would need media queries
      return
    }

    // Map shorthand properties
    const mappedKey = sxPropertyMap[key] || key
    let mappedValue = value

    // Handle spacing values (numbers)
    if (spacingProperties.has(key) && typeof value === 'number') {
      mappedValue = theme?.spacing?.(value) || `${value * 8}px`
    }

    // Handle color values
    if (colorProperties.has(key) && typeof value === 'string') {
      mappedValue = getColorFromTheme(value, theme) || value
    }

    if (Array.isArray(mappedKey)) {
      mappedKey.forEach((k) => {
        styles[k] = mappedValue
      })
    } else {
      styles[mappedKey] = mappedValue
    }
  })

  return styles
}

// Shorthand property mappings
const sxPropertyMap = {
  // Spacing
  m: 'margin',
  mt: 'marginTop',
  mr: 'marginRight',
  mb: 'marginBottom',
  ml: 'marginLeft',
  mx: ['marginLeft', 'marginRight'],
  my: ['marginTop', 'marginBottom'],
  p: 'padding',
  pt: 'paddingTop',
  pr: 'paddingRight',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
  px: ['paddingLeft', 'paddingRight'],
  py: ['paddingTop', 'paddingBottom'],
  // Colors
  bgcolor: 'backgroundColor',
  // Sizing
  w: 'width',
  h: 'height',
  minW: 'minWidth',
  maxW: 'maxWidth',
  minH: 'minHeight',
  maxH: 'maxHeight',
  // Flexbox
  flexGrow: 'flexGrow',
  flexShrink: 'flexShrink',
}

const spacingProperties = new Set([
  'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my',
  'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'gap', 'rowGap', 'columnGap',
])

const colorProperties = new Set([
  'color', 'bgcolor', 'backgroundColor', 'borderColor',
])

function getColorFromTheme(colorPath, theme) {
  if (!theme?.palette) return null
  
  const parts = colorPath.split('.')
  let result = theme.palette
  
  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part]
    } else {
      return null
    }
  }
  
  return typeof result === 'string' ? result : null
}

function defaultShouldForwardProp(prop) {
  return !['sx', 'theme', 'as', 'ownerState'].includes(prop) && !prop.startsWith('$')
}

function getDisplayName(Component) {
  return typeof Component === 'string' 
    ? Component 
    : Component.displayName || Component.name || 'Component'
}

export default styled
