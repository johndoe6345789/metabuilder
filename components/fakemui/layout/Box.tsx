import React, { forwardRef } from 'react'
import { sxToStyle } from '../utils/sx'

export interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  component?: React.ElementType
  sx?: Record<string, unknown>  // MUI sx prop for styling compatibility
  testId?: string
}

export const Box = forwardRef<HTMLElement, BoxProps>(
  ({ children, component: Component = 'div', className = '', sx, style, testId, ...props }, ref) => (
    <Component
      ref={ref}
      className={className}
      style={{ ...sxToStyle(sx), ...style }}
      data-testid={testId}
      {...props}
    >
      {children}
    </Component>
  )
)

Box.displayName = 'Box'
