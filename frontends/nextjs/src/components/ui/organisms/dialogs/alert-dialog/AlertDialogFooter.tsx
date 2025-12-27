'use client'

import { forwardRef, ReactNode } from 'react'
import { DialogActions } from '@mui/material'

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

export { AlertDialogFooter }
export type { AlertDialogFooterProps }
