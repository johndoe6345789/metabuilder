'use client'

import { forwardRef, ReactNode } from 'react'
import { Box } from '@mui/material'

interface SheetTriggerProps {
  children: ReactNode
  onClick?: () => void
  asChild?: boolean
}

const SheetTrigger = forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ children, onClick, asChild, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="span"
        onClick={onClick}
        sx={{ cursor: 'pointer' }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

SheetTrigger.displayName = 'SheetTrigger'

export { SheetTrigger }
export type { SheetTriggerProps }
