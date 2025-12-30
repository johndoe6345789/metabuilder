'use client'

import { forwardRef, ReactNode } from 'react'

import { Button, DialogActions } from '@/fakemui'

interface AlertDialogFooterProps {
  children: ReactNode
}

const AlertDialogFooter = forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  ({ children, ...props }, ref) => {
    return (
      <DialogActions ref={ref} className="alert-dialog-footer" {...props}>
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
      <Button ref={ref} onClick={onClick} variant="ghost" className={className} {...props}>
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
  variant?: 'text' | 'outline' | 'primary'
  autoFocus?: boolean
  className?: string
}

const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  (
    {
      children = 'Confirm',
      onClick,
      color = 'primary',
      variant = 'primary',
      autoFocus = true,
      className,
      ...props
    },
    ref
  ) => {
    const buttonVariant = color === 'error' ? 'danger' : variant
    return (
      <Button
        ref={ref}
        onClick={onClick}
        variant={buttonVariant}
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
