'use client'

import { forwardRef, ReactNode } from 'react'

import { Box, List, Typography } from '@/fakemui'

// CommandList
interface CommandListProps {
  children: ReactNode
  className?: string
}

const CommandList = forwardRef<HTMLDivElement, CommandListProps>(({ children, className, ...props }, ref) => {
  return (
    <Box ref={ref} className={`command-list ${className || ''}`} {...props}>
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
  ({ children = 'No results found.', className, ...props }, ref) => {
    return (
      <Box ref={ref} className={`command-empty ${className || ''}`} {...props}>
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
  ({ children, heading, className, ...props }, ref) => {
    return (
      <Box ref={ref} className={`command-group ${className || ''}`} {...props}>
        {heading && (
          <Typography variant="overline" className="command-group-heading">
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
