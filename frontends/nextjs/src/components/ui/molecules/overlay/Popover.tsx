'use client'

import { forwardRef, ReactNode } from 'react'
import { Box } from '@mui/material'

interface PopoverProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Popover = ({ children }: PopoverProps) => <>{children}</>
Popover.displayName = 'Popover'

interface PopoverTriggerProps {
  children: ReactNode
  asChild?: boolean
}

const PopoverTrigger = forwardRef<HTMLDivElement, PopoverTriggerProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ display: 'inline-flex' }} {...props}>
        {children}
      </Box>
    )
  }
)
PopoverTrigger.displayName = 'PopoverTrigger'

interface PopoverContentProps {
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  className?: string
}

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, align = 'center', sideOffset = 4, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          zIndex: 50,
          minWidth: 200,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          boxShadow: 3,
          p: 2,
          outline: 'none',
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
PopoverContent.displayName = 'PopoverContent'

const PopoverAnchor = forwardRef<HTMLDivElement, { children?: ReactNode }>(
  ({ children, ...props }, ref) => (
    <Box ref={ref} {...props}>
      {children}
    </Box>
  )
)
PopoverAnchor.displayName = 'PopoverAnchor'

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
