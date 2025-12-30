'use client'

import { Dialog, DialogPanel } from '@/fakemui/fakemui/utils'
import { forwardRef, ReactNode } from 'react'

import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from './alert/Actions'
import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert/Content'
import styles from './AlertDialog.module.scss'

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
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        {...props}
      >
        <DialogPanel
          ref={ref}
          sm={maxWidth === 'sm' || maxWidth === 'xs'}
          lg={maxWidth === 'lg'}
          xl={maxWidth === 'xl'}
        >
          {children}
        </DialogPanel>
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
      <span ref={ref} onClick={onClick} className={styles.trigger} {...props}>
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
