'use client'

import { forwardRef, ReactNode } from 'react'
import { Dialog } from '@mui/material'

interface CommandProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

const Command = forwardRef<HTMLDivElement, CommandProps>(
  ({ open, onClose, children, ...props }, ref) => {
    return (
      <Dialog
        ref={ref}
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            position: 'fixed',
            top: '20%',
            m: 0,
            borderRadius: 2,
            maxHeight: '60vh',
            overflow: 'hidden',
          },
        }}
        {...props}
      >
        {children}
      </Dialog>
    )
  }
)

Command.displayName = 'Command'

export { Command }
export type { CommandProps }
