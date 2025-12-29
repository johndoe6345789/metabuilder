'use client'

import { forwardRef, ReactNode } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

// SheetHeader
const SheetHeader = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }} {...props}>
        {children}
      </Box>
    )
  }
)
SheetHeader.displayName = 'SheetHeader'

// SheetFooter
const SheetFooter = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          mt: 'auto',
          pt: 3,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
SheetFooter.displayName = 'SheetFooter'

// SheetTitle
const SheetTitle = forwardRef<HTMLHeadingElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Typography ref={ref} variant="h6" fontWeight={600} {...props}>
        {children}
      </Typography>
    )
  }
)
SheetTitle.displayName = 'SheetTitle'

// SheetDescription
const SheetDescription = forwardRef<
  HTMLParagraphElement,
  { children: ReactNode; className?: string }
>(({ children, ...props }, ref) => {
  return (
    <Typography ref={ref} variant="body2" color="text.secondary" {...props}>
      {children}
    </Typography>
  )
})
SheetDescription.displayName = 'SheetDescription'

// Compatibility exports
const SheetPortal = ({ children }: { children: ReactNode }) => <>{children}</>
const SheetOverlay = forwardRef<HTMLDivElement>((props, ref) => <div ref={ref} {...props} />)
SheetOverlay.displayName = 'SheetOverlay'
const SheetClose = forwardRef<HTMLButtonElement, { children?: ReactNode; asChild?: boolean }>(
  ({ children }, ref) => {
    if (children) return <>{children}</>
    return (
      <IconButton ref={ref} aria-label="close">
        <CloseIcon />
      </IconButton>
    )
  }
)
SheetClose.displayName = 'SheetClose'

export {
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetPortal,
  SheetOverlay,
  SheetClose,
}
