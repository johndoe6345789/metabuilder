import React, { forwardRef } from 'react'
import { sxToStyle } from '../utils/sx'

export interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  elevation?: number
  square?: boolean
  variant?: 'elevation' | 'outlined'
  sx?: Record<string, unknown>
  /** Test ID for automated testing */
  testId?: string
}

export const Paper = forwardRef<HTMLDivElement, PaperProps>(
  ({ children, elevation = 1, square, variant = 'elevation', className = '', sx, style, testId, ...props }, ref) => (
    <div
      ref={ref}
      className={`paper paper--${variant} paper--elevation-${elevation} ${square ? 'paper--square' : ''} ${className}`}
      style={{ ...sxToStyle(sx), ...style }}
      data-testid={testId}
      {...props}
    >
      {children}
    </div>
  )
)

Paper.displayName = 'Paper'
