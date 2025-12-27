'use client'

import { forwardRef, ReactNode } from 'react'
import { Typography } from '@mui/material'

interface AlertDialogTitleProps {
  children: ReactNode
  className?: string
}

const AlertDialogTitle = forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Typography
        ref={ref}
        variant="h6"
        component="span"
        className={className}
        sx={{
          fontWeight: 600,
          textAlign: 'inherit',
        }}
        {...props}
      >
        {children}
      </Typography>
    )
  }
)

AlertDialogTitle.displayName = 'AlertDialogTitle'

export { AlertDialogTitle }
export type { AlertDialogTitleProps }
