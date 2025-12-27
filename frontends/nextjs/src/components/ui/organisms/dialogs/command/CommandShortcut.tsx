'use client'

import { forwardRef, ReactNode } from 'react'
import { Box } from '@mui/material'

interface CommandShortcutProps {
  children: ReactNode
}

const CommandShortcut = forwardRef<HTMLSpanElement, CommandShortcutProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="span"
        sx={{
          ml: 'auto',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
          color: 'text.secondary',
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

CommandShortcut.displayName = 'CommandShortcut'

export { CommandShortcut }
export type { CommandShortcutProps }
