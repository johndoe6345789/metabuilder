'use client'

import { forwardRef, ReactNode } from 'react'
import { Button } from '@mui/material'

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

export { AlertDialogCancel }
export type { AlertDialogCancelProps }
