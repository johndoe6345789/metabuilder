import React from 'react'
import { Spinner } from '../feedback/Spinner'

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children?: React.ReactNode
  icon?: React.ReactNode
  title?: React.ReactNode
  action?: React.ReactNode
  /** Test ID for automated testing */
  testId?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({ children, icon, title, action, testId, className = '', ...props }) => (
  <div className={`empty-state ${className}`} data-testid={testId} role="status" {...props}>
    {icon && <div className="empty-state-icon">{icon}</div>}
    {title && <div className="empty-state-title">{title}</div>}
    <div className="empty-state-content">{children}</div>
    {action && <div className="empty-state-action">{action}</div>}
  </div>
)

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  /** Test ID for automated testing */
  testId?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ children, testId, className = '', ...props }) => (
  <div className={`loading-state ${className}`} data-testid={testId} role="status" {...props}>
    {children || <Spinner />}
  </div>
)

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  /** Test ID for automated testing */
  testId?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({ children, testId, className = '', ...props }) => (
  <div className={`error-state ${className}`} data-testid={testId} role="status" {...props}>
    {children}
  </div>
)

// Namespace object for backward compatibility
export const States = {
  Empty: EmptyState,
  Loading: LoadingState,
  Error: ErrorState,
}
