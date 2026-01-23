import React from 'react'

export interface StatBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  pending?: boolean
  success?: boolean
  error?: boolean
  info?: boolean
}

export const StatBadge: React.FC<StatBadgeProps> = ({ children, pending, success, error, info, className = '', ...props }) => (
  <span
    className={`stat-badge ${pending ? 'stat-badge--pending' : ''} ${success ? 'stat-badge--success' : ''} ${error ? 'stat-badge--error' : ''} ${info ? 'stat-badge--info' : ''} ${className}`}
    {...props}
  >
    {children}
  </span>
)
