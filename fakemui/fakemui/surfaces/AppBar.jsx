import React from 'react'

export const AppBar = ({ children, position = 'fixed', color, className = '', ...props }) => (
  <header className={`app-bar app-bar--${position} ${color ? `app-bar--${color}` : ''} ${className}`} {...props}>{children}</header>
)

export const Toolbar = ({ children, dense, className = '', ...props }) => (
  <div className={`toolbar ${dense ? 'toolbar--dense' : ''} ${className}`} {...props}>{children}</div>
)
