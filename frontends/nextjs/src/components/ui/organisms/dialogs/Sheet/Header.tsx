'use client'

import { forwardRef, ReactNode } from 'react'
import { Box, Typography } from '@mui/material'

interface SheetHeaderProps {
  children: ReactNode
  className?: string
}

const SheetHeader = forwardRef<HTMLDivElement, SheetHeaderProps>(({ children, ...props }, ref) => {
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
})
SheetHeader.displayName = 'SheetHeader'

interface SheetFooterProps {
  children: ReactNode
  className?: string
}

const SheetFooter = forwardRef<HTMLDivElement, SheetFooterProps>(({ children, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column-reverse', sm: 'row' },
        gap: 1,
        pt: 2,
        mt: 'auto',
        justifyContent: { sm: 'flex-end' },
      }}
      {...props}
    >
      {children}
    </Box>
  )
})
SheetFooter.displayName = 'SheetFooter'

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

interface SheetDescriptionProps {
  children: ReactNode
  className?: string
}

const SheetDescription = forwardRef<HTMLParagraphElement, SheetDescriptionProps>(
  ({ children, ...props }, ref) => {
    return (
      <Typography ref={ref} variant="body2" color="text.secondary" {...props}>
        {children}
      </Typography>
    )
  }
)
SheetDescription.displayName = 'SheetDescription'

export { SheetDescription, SheetFooter, SheetHeader, SheetTitle }
