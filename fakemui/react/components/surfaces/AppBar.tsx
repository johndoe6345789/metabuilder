import React from 'react'
import { sxToStyle } from '../utils/sx'

export type AppBarPosition = 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative'

export interface AppBarProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  position?: AppBarPosition
  color?: string
  sx?: Record<string, unknown>
}

export const AppBar: React.FC<AppBarProps> = ({ children, position = 'fixed', color, className = '', sx, style, ...props }) => (
  <header
    className={`app-bar app-bar--${position} ${color ? `app-bar--${color}` : ''} ${className}`}
    style={{ ...sxToStyle(sx), ...style }}
    {...props}
  >
    {children}
  </header>
)

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  dense?: boolean
  disableGutters?: boolean
  variant?: 'regular' | 'dense'
  sx?: Record<string, unknown>
}

export const Toolbar: React.FC<ToolbarProps> = ({ children, dense, disableGutters, variant, className = '', sx, style, ...props }) => (
  <div
    className={`toolbar ${dense || variant === 'dense' ? 'toolbar--dense' : ''} ${disableGutters ? 'toolbar--no-gutters' : ''} ${className}`}
    style={{ ...sxToStyle(sx), ...style }}
    {...props}
  >
    {children}
  </div>
)
