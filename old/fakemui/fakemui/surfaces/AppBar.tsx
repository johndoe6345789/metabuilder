import React from 'react'

export type AppBarPosition = 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative'

export interface AppBarProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  position?: AppBarPosition
  color?: string
}

export const AppBar: React.FC<AppBarProps> = ({ children, position = 'fixed', color, className = '', ...props }) => (
  <header className={`app-bar app-bar--${position} ${color ? `app-bar--${color}` : ''} ${className}`} {...props}>
    {children}
  </header>
)

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  dense?: boolean
}

export const Toolbar: React.FC<ToolbarProps> = ({ children, dense, className = '', ...props }) => (
  <div className={`toolbar ${dense ? 'toolbar--dense' : ''} ${className}`} {...props}>
    {children}
  </div>
)
