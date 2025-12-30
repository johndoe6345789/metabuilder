import React from 'react'
import { Spinner } from '../feedback/Spinner'

export const EmptyState = ({ children, icon, title, action, className = '', ...props }) => (
  <div className={`empty-state ${className}`} {...props}>
    {icon && <div className="empty-state-icon">{icon}</div>}
    {title && <div className="empty-state-title">{title}</div>}
    <div className="empty-state-content">{children}</div>
    {action && <div className="empty-state-action">{action}</div>}
  </div>
)

export const LoadingState = ({ children, className = '', ...props }) => (
  <div className={`loading-state ${className}`} {...props}>{children || <Spinner />}</div>
)

export const ErrorState = ({ children, className = '', ...props }) => (
  <div className={`error-state ${className}`} {...props}>{children}</div>
)
