'use client'

import { forwardRef, ReactNode } from 'react'
import { Button } from '@mui/material'

interface AlertDialogActionProps {
  children?: ReactNode
  onClick?: () => void
  color?: 'primary' | 'error' | 'warning' | 'success' | 'info'
  variant?: 'text' | 'outlined' | 'contained'
  autoFocus?: boolean
  className?: string
}

const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ children = 'Confirm', onClick, color = 'primary', variant = 'contained', autoFocus = true, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        color={color}
        variant={variant}
        autoFocus={autoFocus}
        className={className}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

AlertDialogAction.displayName = 'AlertDialogAction'

export { AlertDialogAction }
export type { AlertDialogActionProps }
