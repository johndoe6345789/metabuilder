import React, { forwardRef } from 'react'

export const BottomNavigation = ({ children, value, onChange, className = '', ...props }) => (
  <nav className={`bottom-nav ${className}`} {...props}>{children}</nav>
)

export const BottomNavigationAction = forwardRef(({ label, icon, value, selected, className = '', ...props }, ref) => (
  <button ref={ref} className={`bottom-nav-action ${selected ? 'bottom-nav-action--selected' : ''} ${className}`} {...props}>
    {icon && <span className="bottom-nav-icon">{icon}</span>}
    {label && <span className="bottom-nav-label">{label}</span>}
  </button>
))
