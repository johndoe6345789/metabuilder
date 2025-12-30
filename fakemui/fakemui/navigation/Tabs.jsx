import React, { forwardRef } from 'react'

export const Tabs = ({ children, value, onChange, variant, className = '', ...props }) => (
  <div className={`tabs ${variant ? `tabs--${variant}` : ''} ${className}`} role="tablist" {...props}>{children}</div>
)

export const Tab = forwardRef(({ children, label, icon, value, selected, disabled, className = '', ...props }, ref) => (
  <button ref={ref} className={`tab ${selected ? 'tab--active' : ''} ${disabled ? 'tab--disabled' : ''} ${className}`} role="tab" aria-selected={selected} disabled={disabled} {...props}>
    {icon && <span className="tab-icon">{icon}</span>}
    {label || children}
  </button>
))
