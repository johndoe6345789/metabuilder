import React from 'react'
import { Spinner } from '../feedback/Spinner'

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children?: React.ReactNode
  icon?: React.ReactNode
  title?: React.ReactNode
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ children, icon, title, action, className = '', ...props }) => (
  <div className={`empty-state ${className}`} {...props}>
    {icon && <div className="empty-state-icon">{icon}</div>}
    {title && <div className="empty-state-title">{title}</div>}
    <div className="empty-state-content">{children}</div>
    {action && <div className="empty-state-action">{action}</div>}
  </div>
)

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const LoadingState: React.FC<LoadingStateProps> = ({ children, className = '', ...props }) => (
  <div className={`loading-state ${className}`} {...props}>
    {children || <Spinner />}
  </div>
)

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const ErrorState: React.FC<ErrorStateProps> = ({ children, className = '', ...props }) => (
  <div className={`error-state ${className}`} {...props}>
    {children}
  </div>
)

// Namespace object for backward compatibility
export const States = {
  Empty: EmptyState,
  Loading: LoadingState,
  Error: ErrorState,
}
