'use client'

import {
  Alert as MuiAlert,
  AlertProps as MuiAlertProps,
  AlertTitle as MuiAlertTitle,
  SxProps,
  Theme,
} from '@mui/material'
import { forwardRef, ReactNode } from 'react'

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

export { Alert, AlertDescription, AlertTitle }
