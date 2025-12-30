'use client'

import { Box, IconButton, Typography } from '@/fakemui'
import { Close } from '@/fakemui/icons'
import { forwardRef, ReactNode } from 'react'

// SheetHeader
const SheetHeader = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <Box ref={ref} className={`sheet-header ${className || ''}`} {...props}>
        {children}
      </Box>
    )
  }
)
SheetHeader.displayName = 'SheetHeader'

// SheetFooter
const SheetFooter = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <Box ref={ref} className={`sheet-footer ${className || ''}`} {...props}>
        {children}
      </Box>
    )
  }
)
SheetFooter.displayName = 'SheetFooter'

// SheetTitle
const SheetTitle = forwardRef<HTMLHeadingElement, { children: ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <Typography ref={ref} variant="h6" className={`sheet-title ${className || ''}`} {...props}>
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
>(({ children, className, ...props }, ref) => {
  return (
    <Typography ref={ref} variant="body2" className={`sheet-description ${className || ''}`} {...props}>
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
        <Close />
      </IconButton>
    )
  }
)
SheetClose.displayName = 'SheetClose'

export {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
}
