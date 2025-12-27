'use client'

import { forwardRef, ReactNode } from 'react'
import { DialogContent, DialogContentText } from '@mui/material'

interface AlertDialogDescriptionProps {
  children: ReactNode
  className?: string
}

const AlertDialogDescription = forwardRef<HTMLDivElement, AlertDialogDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <DialogContent ref={ref} className={className} sx={{ pt: 2 }} {...props}>
        <DialogContentText id="alert-dialog-description">
          {children}
        </DialogContentText>
      </DialogContent>
    )
  }
)

AlertDialogDescription.displayName = 'AlertDialogDescription'

export { AlertDialogDescription }
export type { AlertDialogDescriptionProps }
