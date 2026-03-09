import React from 'react'
import styles from '../../../scss/atoms/alert.module.scss'

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success'
export type AlertVariant = 'standard' | 'filled' | 'outlined'

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children?: React.ReactNode
  title?: React.ReactNode
  severity?: AlertSeverity
  icon?: React.ReactNode | false
  action?: React.ReactNode
  variant?: AlertVariant
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void
  testId?: string
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

const severityClassMap: Record<AlertSeverity, string> = {
  error: styles.alertError,
  warning: styles.alertWarning,
  info: styles.alertInfo,
  success: styles.alertSuccess,
}

const variantClassMap: Record<AlertVariant, string | undefined> = {
  standard: undefined,
  filled: styles.alertFilled,
  outlined: styles.alertOutlined,
}

export const Alert: React.FC<AlertProps> = ({
  children,
  title,
  severity = 'info',
  icon,
  action,
  variant = 'standard',
  onClose,
  testId,
  className = '',
  ...props
}) => {
  const classNames = [
    styles.alert,
    severityClassMap[severity],
    variantClassMap[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} role="alert" aria-live="assertive" aria-label={props['aria-label'] || `${severity.charAt(0).toUpperCase() + severity.slice(1)} alert`} data-testid={testId} {...props}>
      {icon !== false && <span className={styles.alertIcon}>{icon || getDefaultIcon(severity)}</span>}
      <div className={styles.alertContent}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {children}
      </div>
      {action && <div className={styles.alertActions}>{action}</div>}
      {onClose && (
        <button className={styles.alertClose} onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  )
}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const AlertTitle: React.FC<AlertTitleProps> = ({ children, className = '', ...props }) => (
  <div className={`${styles.alertTitle} ${className}`.trim()} {...props}>
    {children}
  </div>
)

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className = '', ...props }) => (
  <p className={`${styles.alertMessage} ${className}`.trim()} {...props}>
    {children}
  </p>
)
