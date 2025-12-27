'use client'

import { forwardRef, ReactNode } from 'react'
import { Box } from '@mui/material'

interface SheetFooterProps {
  children: ReactNode
  className?: string
}

const SheetFooter = forwardRef<HTMLDivElement, SheetFooterProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          gap: 1,
          pt: 2,
          mt: 'auto',
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

SheetFooter.displayName = 'SheetFooter'

export { SheetFooter }
export type { SheetFooterProps }
