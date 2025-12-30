import React, { forwardRef } from 'react'

export const List = ({ children, dense, spaced, className = '', ...props }) => (
  <ul className={`list ${dense ? 'list--dense' : ''} ${spaced ? 'list--spaced' : ''} ${className}`} {...props}>{children}</ul>
)

export const ListItem = ({ children, clickable, selected, disabled, borderless, className = '', ...props }) => (
  <li className={`list-item ${clickable ? 'list-item--clickable' : ''} ${selected ? 'list-item--selected' : ''} ${disabled ? 'list-item--disabled' : ''} ${borderless ? 'list-item--borderless' : ''} ${className}`} {...props}>{children}</li>
)

export const ListItemButton = forwardRef(({ children, selected, className = '', ...props }, ref) => (
  <button ref={ref} className={`list-item-button ${selected ? 'list-item-button--selected' : ''} ${className}`} {...props}>{children}</button>
))

export const ListItemIcon = ({ children, className = '', ...props }) => (
  <span className={`list-item-icon ${className}`} {...props}>{children}</span>
)

export const ListItemText = ({ primary, secondary, className = '', ...props }) => (
  <div className={`list-item-text ${className}`} {...props}>
    {primary && <span className="list-item-title">{primary}</span>}
    {secondary && <span className="list-item-meta">{secondary}</span>}
  </div>
)

export const ListItemAvatar = ({ children, className = '', ...props }) => (
  <div className={`list-item-avatar ${className}`} {...props}>{children}</div>
)

export const ListSubheader = ({ children, className = '', ...props }) => (
  <li className={`list-subheader ${className}`} {...props}>{children}</li>
)
