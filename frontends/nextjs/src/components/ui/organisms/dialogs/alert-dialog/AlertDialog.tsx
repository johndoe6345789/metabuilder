'use client'

import { forwardRef, ReactNode } from 'react'
import { Dialog } from '@mui/material'

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

export { AlertDialog }
export type { AlertDialogProps }
