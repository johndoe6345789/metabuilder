'use client'

import { forwardRef, ReactNode } from 'react'
import { Box } from '@mui/material'

interface SheetHeaderProps {
  children: ReactNode
  className?: string
}

const SheetHeader = forwardRef<HTMLDivElement, SheetHeaderProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          pb: 2,
          textAlign: 'left',
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

SheetHeader.displayName = 'SheetHeader'

export { SheetHeader }
export type { SheetHeaderProps }
