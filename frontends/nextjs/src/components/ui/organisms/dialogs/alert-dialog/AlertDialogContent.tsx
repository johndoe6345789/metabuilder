'use client'

import { forwardRef, ReactNode } from 'react'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface AlertDialogContentProps {
  children: ReactNode
  showCloseButton?: boolean
  onClose?: () => void
  className?: string
}

const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ children, showCloseButton = false, onClose, className, ...props }, ref) => {
    return (
      <>
        {showCloseButton && onClose && (
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
        {children}
      </>
    )
  }
)

AlertDialogContent.displayName = 'AlertDialogContent'

export { AlertDialogContent }
export type { AlertDialogContentProps }
