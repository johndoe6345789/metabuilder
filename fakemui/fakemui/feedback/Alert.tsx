import React from 'react'

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success'
export type AlertVariant = 'standard' | 'filled' | 'outlined'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  title?: React.ReactNode
  severity?: AlertSeverity
  icon?: React.ReactNode | false
  action?: React.ReactNode
  variant?: AlertVariant
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

function getDefaultIcon(severity: AlertSeverity): string {
  switch (severity) {
    case 'error':
      return '✕'
    case 'warning':
      return '⚠'
    case 'info':
      return 'ℹ'
    case 'success':
      return '✓'
    default:
      return 'ℹ'
  }
}

export const Alert: React.FC<AlertProps> = ({
  children,
  title,
  severity = 'info',
  icon,
  action,
  variant = 'standard',
  onClose,
  className = '',
  ...props
}) => (
  <div className={`alert alert--${severity} alert--${variant} ${className}`} role="alert" {...props}>
    {icon !== false && <span className="alert-icon">{icon || getDefaultIcon(severity)}</span>}
    <div className="alert-content">
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </div>
    {action && <div className="alert-action">{action}</div>}
    {onClose && (
      <button className="alert-close" onClick={onClose} aria-label="Close">
        ×
      </button>
    )}
  </div>
)

export interface AlertTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const AlertTitle: React.FC<AlertTitleProps> = ({ children, className = '', ...props }) => (
  <div className={`alert-title ${className}`} {...props}>
    {children}
  </div>
)
