'use client'

import { forwardRef, ReactNode } from 'react'
import { DialogContent as MuiDialogContent, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export interface DialogBodyProps {
  children: ReactNode
  className?: string
  onClose?: () => void
  showCloseButton?: boolean
}

const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ children, showCloseButton = true, onClose, ...props }, ref) => {
    return (
      <MuiDialogContent ref={ref} sx={{ position: 'relative', pt: showCloseButton ? 6 : 2 }} {...props}>
        {showCloseButton && onClose && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        )}
        {children}
      </MuiDialogContent>
    )
  },
)
DialogBody.displayName = 'DialogBody'

export type DialogContentProps = DialogBodyProps
const DialogContent = DialogBody

export { DialogBody, DialogContent }
