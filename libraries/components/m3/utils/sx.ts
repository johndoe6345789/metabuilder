/**
 * MUI-compatible sx prop utility
 * Converts sx prop to inline styles with theme-aware spacing
 */

const SPACING_UNIT = 8 // 8px per unit (MUI default)

type SxValue = string | number | Record<string, unknown>

/**
 * Convert spacing values (1 = 8px, 2 = 16px, etc.)
 */
const convertSpacing = (value: unknown): string => {
  if (typeof value === 'number') {
    return `${value * SPACING_UNIT}px`
  }
  return String(value)
}

/**
 * Map sx shorthand properties to CSS properties
 */
const sxToCssMap: Record<string, string | string[]> = {
  // Spacing shorthands
  m: 'margin',
  mt: 'marginTop',
  mb: 'marginBottom',
  ml: 'marginLeft',
  mr: 'marginRight',
  mx: ['marginLeft', 'marginRight'],
  my: ['marginTop', 'marginBottom'],
  p: 'padding',
  pt: 'paddingTop',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
  pr: 'paddingRight',
  px: ['paddingLeft', 'paddingRight'],
  py: ['paddingTop', 'paddingBottom'],
  // Layout
  gap: 'gap',
  rowGap: 'rowGap',
  columnGap: 'columnGap',
  // Colors
  bgcolor: 'backgroundColor',
  color: 'color',
  // Borders
  border: 'border',
  borderRadius: 'borderRadius',
  borderColor: 'borderColor',
  // Sizing
  width: 'width',
  height: 'height',
  minWidth: 'minWidth',
  maxWidth: 'maxWidth',
  minHeight: 'minHeight',
  maxHeight: 'maxHeight',
  // Typography
  fontSize: 'fontSize',
  fontWeight: 'fontWeight',
  lineHeight: 'lineHeight',
  textAlign: 'textAlign',
  // Flexbox
  display: 'display',
  flex: 'flex',
  flexDirection: 'flexDirection',
  flexWrap: 'flexWrap',
  justifyContent: 'justifyContent',
  alignItems: 'alignItems',
  alignContent: 'alignContent',
  alignSelf: 'alignSelf',
  // Grid
  gridTemplateColumns: 'gridTemplateColumns',
  gridTemplateRows: 'gridTemplateRows',
  gridColumn: 'gridColumn',
  gridRow: 'gridRow',
  // Position
  position: 'position',
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  left: 'left',
  zIndex: 'zIndex',
  // Effects
  boxShadow: 'boxShadow',
  opacity: 'opacity',
  overflow: 'overflow',
  cursor: 'cursor',
  // Transforms
  transform: 'transform',
  transition: 'transition',
}

// Properties that use spacing units (MUI 8px multiplier)
const spacingProperties = new Set([
  'm', 'mt', 'mb', 'ml', 'mr', 'mx', 'my',
  'p', 'pt', 'pb', 'pl', 'pr', 'px', 'py',
  'gap', 'rowGap', 'columnGap',
])

// Properties that need px suffix when given a number (but NOT spacing multiplied)
const pixelProperties = new Set([
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
  'top', 'right', 'bottom', 'left',
  'fontSize', 'borderRadius',
])

/**
 * Convert pixel values - just appends px to numbers
 */
const convertPixel = (value: unknown): string | number => {
  if (typeof value === 'number') {
    return `${value}px`
  }
  return value as string | number
}

/**
 * Convert MUI color shortcuts to actual values
 */
const convertColor = (value: string): string => {
  // Handle MUI color shortcuts like 'primary.main', 'text.secondary'
  const colorMap: Record<string, string> = {
    'primary.main': 'var(--mat-sys-primary)',
    'primary.light': 'var(--mat-sys-primary-container)',
    'primary.dark': 'var(--mat-sys-primary)',
    'secondary.main': 'var(--mat-sys-secondary)',
    'error.main': 'var(--mat-sys-error)',
    'warning.main': 'var(--mat-sys-tertiary)',
    'info.main': 'var(--mat-sys-primary)',
    'success.main': 'var(--mat-sys-tertiary)',
    'text.primary': 'var(--mat-sys-on-surface)',
    'text.secondary': 'var(--mat-sys-on-surface-variant)',
    'text.disabled': 'var(--mat-sys-outline)',
    'background.paper': 'var(--mat-sys-surface)',
    'background.default': 'var(--mat-sys-surface-container)',
    'divider': 'var(--mat-sys-outline-variant)',
  }
  return colorMap[value] || value
}

/**
 * Convert sx prop object to React inline style object
 */
export const sxToStyle = (sx?: Record<string, unknown>): React.CSSProperties | undefined => {
  if (!sx) return undefined

  const style: Record<string, string | number> = {}

  for (const [key, value] of Object.entries(sx)) {
    if (value === undefined || value === null) continue

    // Handle nested selectors like '&:hover' - skip them for inline styles
    if (key.startsWith('&') || key.startsWith('.')) continue

    const cssProperty = sxToCssMap[key] || key

    // Convert value based on property type
    const convertValue = (val: unknown, propKey: string): string | number => {
      if (spacingProperties.has(propKey)) {
        return convertSpacing(val) as string
      }
      if (pixelProperties.has(propKey)) {
        return convertPixel(val) as string | number
      }
      if (typeof val === 'string' && (propKey === 'color' || propKey === 'bgcolor' || propKey === 'backgroundColor')) {
        return convertColor(val)
      }
      return val as string | number
    }

    // Handle array properties (mx, my, px, py)
    if (Array.isArray(cssProperty)) {
      for (const prop of cssProperty) {
        style[prop] = convertValue(value, key)
      }
    } else {
      style[cssProperty] = convertValue(value, key)
    }
  }

  return style as React.CSSProperties
}

export default sxToStyle
