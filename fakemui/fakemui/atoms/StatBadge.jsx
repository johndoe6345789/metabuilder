import React from 'react'

export const StatBadge = ({ children, pending, success, error, info, className = '', ...props }) => (
  <span className={`stat-badge ${pending ? 'stat-badge--pending' : ''} ${success ? 'stat-badge--success' : ''} ${error ? 'stat-badge--error' : ''} ${info ? 'stat-badge--info' : ''} ${className}`} {...props}>{children}</span>
)
