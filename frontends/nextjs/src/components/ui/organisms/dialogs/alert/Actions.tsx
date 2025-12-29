'use client'

import { forwardRef, ReactNode } from 'react'
import { Button, DialogActions } from '@mui/material'

interface AlertDialogFooterProps {
  children: ReactNode
}

const AlertDialogFooter = forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  ({ children, ...props }, ref) => {
    return (
      <DialogActions ref={ref} sx={{ p: 2, pt: 0 }} {...props}>
        {children}
      </DialogActions>
    )
  }
)
AlertDialogFooter.displayName = 'AlertDialogFooter'

interface AlertDialogCancelProps {
  children?: ReactNode
  onClick?: () => void
  className?: string
}

const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  ({ children = 'Cancel', onClick, className, ...props }, ref) => {
    return (
      <Button ref={ref} onClick={onClick} color="inherit" className={className} {...props}>
        {children}
      </Button>
    )
  }
)
AlertDialogCancel.displayName = 'AlertDialogCancel'

interface AlertDialogActionProps {
  children?: ReactNode
  onClick?: () => void
  color?: 'primary' | 'error' | 'warning' | 'success' | 'info'
  variant?: 'text' | 'outlined' | 'contained'
  autoFocus?: boolean
  className?: string
}

const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  (
    {
      children = 'Confirm',
      onClick,
      color = 'primary',
      variant = 'contained',
      autoFocus = true,
      className,
      ...props
    },
    ref
  ) => {
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

export { AlertDialogAction, AlertDialogCancel, AlertDialogFooter }
