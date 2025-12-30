'use client'

import { forwardRef, ReactNode } from 'react'

import { Paper } from '@/fakemui'

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
  ({ children, onValueChange, value, shouldFilter = true, className, ...props }, ref) => {
    return (
      <Paper
        ref={ref}
        variant="outlined"
        className={`command-container ${className || ''}`}
        {...props}
      >
        {children}
      </Paper>
    )
  }
)
CommandCore.displayName = 'CommandCore'

export { CommandCore }
