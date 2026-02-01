import React from 'react'
import { sxToStyle } from '../utils/sx'

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  direction?: 'row' | 'column'
  spacing?: string | number
  alignItems?: string
  justifyContent?: string
  divider?: React.ReactNode
  sx?: Record<string, unknown>
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'column',
  spacing,
  alignItems,
  justifyContent,
  divider,
  className = '',
  sx,
  style,
  ...props
}) => (
  <div
    className={`stack ${direction === 'row' ? 'flex' : 'flex flex-col'} ${spacing ? `gap-${spacing}` : ''} ${alignItems ? `items-${alignItems}` : ''} ${justifyContent ? `justify-${justifyContent}` : ''} ${className}`}
    style={{ ...sxToStyle(sx), ...style }}
    {...props}
  >
    {divider ? React.Children.toArray(children).flatMap((child, i) => (i > 0 ? [divider, child] : [child])) : children}
  </div>
)
