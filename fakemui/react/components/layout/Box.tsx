import React, { forwardRef } from 'react'

export interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  component?: React.ElementType
  sx?: Record<string, unknown>  // MUI sx prop for styling compatibility
}

export const Box = forwardRef<HTMLElement, BoxProps>(
  ({ children, component: Component = 'div', className = '', sx, ...props }, ref) => (
    <Component ref={ref} className={className} {...props}>
      {children}
    </Component>
  )
)

Box.displayName = 'Box'
