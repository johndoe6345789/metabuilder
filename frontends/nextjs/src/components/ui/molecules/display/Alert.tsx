'use client'

import { forwardRef, ReactNode } from 'react'
import {
  Alert as MuiAlert,
  AlertTitle as MuiAlertTitle,
  AlertProps as MuiAlertProps,
  SxProps,
  Theme,
} from '@mui/material'

export type AlertVariant = 'default' | 'destructive'

export interface AlertProps {
  variant?: AlertVariant
  children?: ReactNode
  className?: string
  sx?: SxProps<Theme>
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'default', children, className, sx, ...props }, ref) => {
    const severity = variant === 'destructive' ? 'error' : 'info'

    return (
      <MuiAlert
        ref={ref}
        severity={severity}
        variant="outlined"
        className={className}
        sx={{
          borderRadius: 2,
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiAlert>
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
    <MuiAlertTitle ref={ref} {...props}>
      {children}
    </MuiAlertTitle>
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

export { Alert, AlertTitle, AlertDescription }
