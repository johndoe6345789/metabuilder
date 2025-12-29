'use client'

import CloseIcon from '@mui/icons-material/Close'
import {
  Alert as MuiAlert,
  AlertProps as MuiAlertProps,
  AlertTitle as MuiAlertTitle,
  Collapse,
  IconButton,
  SxProps,
  Theme,
} from '@mui/material'
import { forwardRef, ReactNode } from 'react'

export type AlertVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info'

export interface AlertProps {
  variant?: AlertVariant
  title?: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  children?: ReactNode
  className?: string
  sx?: SxProps<Theme>
}

const variantMap: Record<AlertVariant, MuiAlertProps['severity']> = {
  default: 'info',
  destructive: 'error',
  success: 'success',
  warning: 'warning',
  info: 'info',
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    { variant = 'default', title, dismissible, onDismiss, children, className, sx, ...props },
    ref
  ) => {
    const severity = variantMap[variant]

    return (
      <MuiAlert
        ref={ref}
        severity={severity}
        variant="outlined"
        className={className}
        action={
          dismissible && onDismiss ? (
            <IconButton aria-label="close" color="inherit" size="small" onClick={onDismiss}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          ) : undefined
        }
        sx={{ borderRadius: 1, ...sx }}
      >
        {title && <MuiAlertTitle>{title}</MuiAlertTitle>}
        {children}
      </MuiAlert>
    )
  }
)

Alert.displayName = 'Alert'

// AlertTitle (for direct use)
const AlertTitle = MuiAlertTitle

// AlertDescription (shadcn compat)
const AlertDescription = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
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
