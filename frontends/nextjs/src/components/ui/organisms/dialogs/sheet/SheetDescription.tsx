'use client'

import { forwardRef, ReactNode } from 'react'
import { Typography } from '@mui/material'

interface SheetDescriptionProps {
  children: ReactNode
  className?: string
}

const SheetDescription = forwardRef<HTMLParagraphElement, SheetDescriptionProps>(
  ({ children, ...props }, ref) => {
    return (
      <Typography
        ref={ref}
        variant="body2"
        color="text.secondary"
        {...props}
      >
        {children}
      </Typography>
    )
  }
)

SheetDescription.displayName = 'SheetDescription'

export { SheetDescription }
export type { SheetDescriptionProps }
