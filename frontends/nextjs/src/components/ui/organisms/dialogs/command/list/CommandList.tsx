'use client'

import { forwardRef, ReactNode } from 'react'
import { Box } from '@mui/material'

interface CommandListProps {
  children: ReactNode
}

const CommandList = forwardRef<HTMLDivElement, CommandListProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          maxHeight: 300,
          overflow: 'auto',
          py: 1,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

CommandList.displayName = 'CommandList'

export { CommandList }
export type { CommandListProps }
