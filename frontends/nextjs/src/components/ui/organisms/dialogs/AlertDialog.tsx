'use client'

import { forwardRef, ReactNode } from 'react'
import { Dialog } from '@mui/material'

import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert/Content'
import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from './alert/Actions'

interface AlertDialogProps {
  open: boolean
  onClose?: () => void
  onOpenChange?: (open: boolean) => void
  children: ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
}

const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  ({ open, onClose, onOpenChange, children, maxWidth = 'sm', fullWidth = true, ...props }, ref) => {
    const handleClose = () => {
      onClose?.()
      onOpenChange?.(false)
    }
    return (
      <Dialog
        ref={ref}
        open={open}
        onClose={handleClose}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        {...props}
      >
        {children}
      </Dialog>
    )
  }
)
AlertDialog.displayName = 'AlertDialog'

interface AlertDialogTriggerProps {
  children: ReactNode
  onClick?: () => void
  asChild?: boolean
}

const AlertDialogTrigger = forwardRef<HTMLSpanElement, AlertDialogTriggerProps>(
  ({ children, onClick, asChild, ...props }, ref) => {
    return (
      <span ref={ref} onClick={onClick} style={{ cursor: 'pointer' }} {...props}>
        {children}
      </span>
    )
  }
)
AlertDialogTrigger.displayName = 'AlertDialogTrigger'

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
}
