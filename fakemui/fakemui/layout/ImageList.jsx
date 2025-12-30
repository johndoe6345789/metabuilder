import React from 'react'

export const ImageList = ({ children, cols = 2, gap, className = '', ...props }) => (
  <div className={`image-list image-list--cols-${cols} ${gap ? `gap-${gap}` : ''} ${className}`} {...props}>{children}</div>
)

export const ImageListItem = ({ children, cols = 1, rows = 1, className = '', ...props }) => (
  <div className={`image-list-item ${className}`} style={{ gridColumn: `span ${cols}`, gridRow: `span ${rows}` }} {...props}>{children}</div>
)

export const ImageListItemBar = ({ title, subtitle, actionIcon, position = 'bottom', className = '', ...props }) => (
  <div className={`image-list-item-bar image-list-item-bar--${position} ${className}`} {...props}>
    <div className="image-list-item-bar-content">
      {title && <span className="image-list-item-bar-title">{title}</span>}
      {subtitle && <span className="image-list-item-bar-subtitle">{subtitle}</span>}
    </div>
    {actionIcon && <span className="image-list-item-bar-action">{actionIcon}</span>}
  </div>
)
