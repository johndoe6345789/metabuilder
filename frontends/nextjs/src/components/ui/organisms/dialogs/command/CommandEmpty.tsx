'use client'

import { forwardRef, ReactNode } from 'react'
import { Box } from '@mui/material'

interface CommandEmptyProps {
  children?: ReactNode
}

const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ children = 'No results found.', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          py: 6,
          textAlign: 'center',
          color: 'text.secondary',
          fontSize: '0.875rem',
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

CommandEmpty.displayName = 'CommandEmpty'

export { CommandEmpty }
export type { CommandEmptyProps }
