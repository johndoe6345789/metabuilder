import React from 'react'

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  direction?: 'row' | 'column'
  spacing?: string | number
  alignItems?: string
  justifyContent?: string
  divider?: React.ReactNode
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'column',
  spacing,
  alignItems,
  justifyContent,
  divider,
  className = '',
  ...props
}) => (
  <div
    className={`stack ${direction === 'row' ? 'flex' : 'flex flex-col'} ${spacing ? `gap-${spacing}` : ''} ${alignItems ? `items-${alignItems}` : ''} ${justifyContent ? `justify-${justifyContent}` : ''} ${className}`}
    {...props}
  >
    {divider ? React.Children.toArray(children).flatMap((child, i) => (i > 0 ? [divider, child] : [child])) : children}
  </div>
)
