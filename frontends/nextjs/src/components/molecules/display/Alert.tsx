'use client'

import { forwardRef, ReactNode } from 'react'

import { Alert as FakeMuiAlert, AlertTitle as FakeMuiAlertTitle, IconButton } from '@/fakemui'
import { Close } from '@/fakemui/icons'

export type AlertVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info'

export interface AlertProps {
  variant?: AlertVariant
  title?: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  children?: ReactNode
  className?: string
}

const variantMap: Record<AlertVariant, 'info' | 'error' | 'success' | 'warning'> = {
  default: 'info',
  destructive: 'error',
  success: 'success',
  warning: 'warning',
  info: 'info',
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    { variant = 'default', title, dismissible, onDismiss, children, className, ...props },
    ref
  ) => {
    const severity = variantMap[variant]

    return (
      <FakeMuiAlert
        ref={ref}
        severity={severity}
        variant="outlined"
        className={`alert ${className || ''}`}
        action={
          dismissible && onDismiss ? (
            <IconButton aria-label="close" onClick={onDismiss}>
              <Close size={16} />
            </IconButton>
          ) : undefined
        }
        {...props}
      >
        {title && <FakeMuiAlertTitle>{title}</FakeMuiAlertTitle>}
        {children}
      </FakeMuiAlert>
    )
  }
)

Alert.displayName = 'Alert'

// AlertTitle (for direct use)
const AlertTitle = FakeMuiAlertTitle

// AlertDescription (shadcn compat)
const AlertDescription = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={`alert-description ${className || ''}`} {...props}>
        {children}
      </div>
    )
  }
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription, AlertTitle }
