import React from 'react'
import { sxToStyle } from '../utils/sx'

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  container?: boolean
  item?: boolean
  xs?: number | boolean
  sm?: number | boolean
  md?: number | boolean
  lg?: number | boolean
  xl?: number | boolean
  spacing?: string | number
  direction?: 'row' | 'column'
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  sx?: Record<string, unknown>
}

export const Grid: React.FC<GridProps> = ({
  children,
  container,
  item,
  xs,
  sm,
  md,
  lg,
  xl,
  spacing,
  direction,
  alignItems,
  justifyContent,
  className = '',
  sx,
  style,
  ...props
}) => (
  <div
    className={`${container ? 'grid-container' : ''} ${item ? 'grid-item' : ''} ${spacing ? `gap-${spacing}` : ''} ${direction ? `flex-${direction}` : ''} ${alignItems ? `items-${alignItems}` : ''} ${justifyContent ? `justify-${justifyContent}` : ''} ${xs ? `col-${xs === true ? 12 : xs}` : ''} ${sm ? `col-sm-${sm === true ? 12 : sm}` : ''} ${md ? `col-md-${md === true ? 12 : md}` : ''} ${lg ? `col-lg-${lg === true ? 12 : lg}` : ''} ${className}`}
    style={{ ...sxToStyle(sx), ...style }}
    {...props}
  >
    {children}
  </div>
)
