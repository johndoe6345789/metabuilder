import React from 'react'

export const Tooltip = ({ children, title, placement = 'top', className = '', ...props }) => (
  <span className={`tooltip-wrapper ${className}`} data-tooltip={title} data-placement={placement} {...props}>{children}</span>
)
