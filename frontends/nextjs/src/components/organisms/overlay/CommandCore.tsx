'use client'

import { Paper } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

// Command container (like cmdk)
export interface CommandProps {
  children: ReactNode
  className?: string
  onValueChange?: (value: string) => void
  value?: string
  filter?: (value: string, search: string) => number
  shouldFilter?: boolean
}

const CommandCore = forwardRef<HTMLDivElement, CommandProps>(
  ({ children, onValueChange, value, shouldFilter = true, ...props }, ref) => {
    return (
      <Paper
        ref={ref}
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
        }}
        {...props}
      >
        {children}
      </Paper>
    )
  }
)
CommandCore.displayName = 'CommandCore'

export { CommandCore }
