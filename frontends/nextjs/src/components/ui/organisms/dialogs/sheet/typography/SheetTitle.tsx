'use client'

import { forwardRef, ReactNode } from 'react'
import { Typography } from '@mui/material'

interface SheetTitleProps {
  children: ReactNode
  className?: string
}

const SheetTitle = forwardRef<HTMLHeadingElement, SheetTitleProps>(
  ({ children, ...props }, ref) => {
    return (
      <Typography
        ref={ref}
        variant="h6"
        component="h2"
        sx={{
          fontWeight: 600,
          lineHeight: 1.2,
        }}
        {...props}
      >
        {children}
      </Typography>
    )
  }
)

SheetTitle.displayName = 'SheetTitle'

export { SheetTitle }
export type { SheetTitleProps }
