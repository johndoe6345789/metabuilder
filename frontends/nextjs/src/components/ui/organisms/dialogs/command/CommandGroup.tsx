'use client'

import { forwardRef, ReactNode } from 'react'
import { Box, List, Typography } from '@mui/material'

interface CommandGroupProps {
  heading?: string
  children: ReactNode
}

const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ heading, children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ py: 0.5 }} {...props}>
        {heading && (
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              display: 'block',
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          >
            {heading}
          </Typography>
        )}
        <List disablePadding dense>
          {children}
        </List>
      </Box>
    )
  }
)

CommandGroup.displayName = 'CommandGroup'

export { CommandGroup }
export type { CommandGroupProps }
