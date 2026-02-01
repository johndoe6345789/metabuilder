import React, { forwardRef } from 'react'
import { sxToStyle } from '../utils/sx'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  /** Size variant (FakeMUI native) */
  sm?: boolean
  lg?: boolean
  /** Size variant (MUI-style) */
  size?: 'small' | 'medium' | 'large'
  /** Color variant */
  color?: 'default' | 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  /** Edge alignment for toolbar positioning */
  edge?: 'start' | 'end' | false
  /** MUI sx prop */
  sx?: Record<string, unknown>
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, sm, lg, size, color, edge, className = '', sx, style, ...props }, ref) => {
    // Determine size class
    const sizeClass = size === 'small' || sm
      ? 'icon-btn--sm'
      : size === 'large' || lg
        ? 'icon-btn--lg'
        : ''

    // Determine color class
    const colorClass = color && color !== 'default' ? `icon-btn--${color}` : ''

    // Determine edge class
    const edgeClass = edge === 'start' ? 'icon-btn--edge-start' : edge === 'end' ? 'icon-btn--edge-end' : ''

    return (
      <button
        ref={ref}
        className={`icon-btn ${sizeClass} ${colorClass} ${edgeClass} ${className}`}
        style={{ ...sxToStyle(sx), ...style }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'
