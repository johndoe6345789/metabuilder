import React from 'react'

export const Icon = ({ children, sm, lg, color, className = '', ...props }) => (
  <span className={`icon ${sm ? 'icon--sm' : ''} ${lg ? 'icon--lg' : ''} ${color ? `icon--${color}` : ''} ${className}`} {...props}>{children}</span>
)
