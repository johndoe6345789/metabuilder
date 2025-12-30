import React, { forwardRef } from 'react'

export const ToggleButton = forwardRef(({ children, selected, className = '', ...props }, ref) => (
  <button ref={ref} className={`toggle-btn ${selected ? 'toggle-btn--selected' : ''} ${className}`} {...props}>{children}</button>
))

export const ToggleButtonGroup = ({ children, className = '', ...props }) => (
  <div className={`toggle-btn-group ${className}`} {...props}>{children}</div>
)
