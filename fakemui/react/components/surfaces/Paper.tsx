import React from 'react'
import { sxToStyle } from '../utils/sx'

export interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  elevation?: number
  square?: boolean
  variant?: 'elevation' | 'outlined'
  sx?: Record<string, unknown>
}

export const Paper: React.FC<PaperProps> = ({
  children,
  elevation = 1,
  square,
  variant = 'elevation',
  className = '',
  sx,
  style,
  ...props
}) => (
  <div
    className={`paper paper--${variant} paper--elevation-${elevation} ${square ? 'paper--square' : ''} ${className}`}
    style={{ ...sxToStyle(sx), ...style }}
    {...props}
  >
    {children}
  </div>
)
