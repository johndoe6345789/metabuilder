import React from 'react'

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  container?: boolean
  item?: boolean
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  spacing?: string | number
  direction?: 'row' | 'column'
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
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
  ...props
}) => (
  <div
    className={`${container ? 'grid-container' : ''} ${item ? 'grid-item' : ''} ${spacing ? `gap-${spacing}` : ''} ${direction ? `flex-${direction}` : ''} ${alignItems ? `items-${alignItems}` : ''} ${justifyContent ? `justify-${justifyContent}` : ''} ${xs ? `col-${xs}` : ''} ${sm ? `col-sm-${sm}` : ''} ${md ? `col-md-${md}` : ''} ${lg ? `col-lg-${lg}` : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
)
