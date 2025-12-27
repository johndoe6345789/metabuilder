'use client'

import { forwardRef, ReactNode } from 'react'
import { Box } from '@mui/material'

interface SheetCloseProps {
  children: ReactNode
  onClick?: () => void
  asChild?: boolean
}

const SheetClose = forwardRef<HTMLButtonElement, SheetCloseProps>(
  ({ children, onClick, ...props }, ref) => {
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

SheetClose.displayName = 'SheetClose'

export { SheetClose }
export type { SheetCloseProps }
