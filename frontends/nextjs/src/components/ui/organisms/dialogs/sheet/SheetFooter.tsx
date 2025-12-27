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
          flexDirection: 'column-reverse',
          gap: 1,
          pt: 2,
          mt: 'auto',
          sm: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
          },
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
