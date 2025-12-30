'use client'

import { forwardRef, ReactNode } from 'react'

import { Alert as FakeMuiAlert, AlertTitle as FakeMuiAlertTitle } from '@/fakemui'

export type AlertVariant = 'default' | 'destructive'

export interface AlertProps {
  variant?: AlertVariant
  children?: ReactNode
  className?: string
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'default', children, className, ...props }, ref) => {
    const severity = variant === 'destructive' ? 'error' : 'info'

    return (
      <FakeMuiAlert
        ref={ref}
        severity={severity}
        variant="outlined"
        className={className}
        {...props}
      >
        {children}
      </FakeMuiAlert>
    )
  }
)

Alert.displayName = 'Alert'

interface AlertTitleProps {
  children: ReactNode
  className?: string
}

const AlertTitle = forwardRef<HTMLDivElement, AlertTitleProps>(({ children, ...props }, ref) => {
  return (
    <FakeMuiAlertTitle ref={ref} {...props}>
      {children}
    </FakeMuiAlertTitle>
  )
})
AlertTitle.displayName = 'AlertTitle'

interface AlertDescriptionProps {
  children: ReactNode
  className?: string
}

const AlertDescription = forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    )
  }
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription, AlertTitle }
