'use client'

import { Box, List, Typography } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

// CommandList
interface CommandListProps {
  children: ReactNode
  className?: string
}

const CommandList = forwardRef<HTMLDivElement, CommandListProps>(({ children, ...props }, ref) => {
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
      <List dense disablePadding>
        {children}
      </List>
    </Box>
  )
})
CommandList.displayName = 'CommandList'

// CommandEmpty
interface CommandEmptyProps {
  children?: ReactNode
  className?: string
}

const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ children = 'No results found.', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          py: 4,
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

// CommandGroup
interface CommandGroupProps {
  children: ReactNode
  heading?: string
  className?: string
}

const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ children, heading, ...props }, ref) => {
    return (
      <Box ref={ref} {...props}>
        {heading && (
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ px: 2, py: 1, display: 'block' }}
          >
            {heading}
          </Typography>
        )}
        {children}
      </Box>
    )
  }
)
CommandGroup.displayName = 'CommandGroup'

export { CommandEmpty, CommandGroup, CommandList }
