'use client'

import { forwardRef, ReactNode } from 'react'
import {
  Drawer as MuiDrawer,
  DrawerProps as MuiDrawerProps,
  Box,
  IconButton,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

// Sheet (side panel drawer)
export interface SheetProps extends Omit<MuiDrawerProps, 'onClose'> {
  side?: 'left' | 'right' | 'top' | 'bottom'
  onOpenChange?: (open: boolean) => void
}

const Sheet = forwardRef<HTMLDivElement, SheetProps>(
  ({ open, side = 'right', onOpenChange, children, ...props }, ref) => {
    return (
      <MuiDrawer
        ref={ref}
        anchor={side}
        open={open}
        onClose={() => onOpenChange?.(false)}
        PaperProps={{
          sx: {
            width: side === 'left' || side === 'right' ? 320 : '100%',
            height: side === 'top' || side === 'bottom' ? 'auto' : '100%',
            maxWidth: '100vw',
          },
        }}
        {...props}
      >
        {children}
      </MuiDrawer>
    )
  }
)
Sheet.displayName = 'Sheet'

// SheetTrigger
interface SheetTriggerProps {
  children: ReactNode
  asChild?: boolean
  onClick?: () => void
}

const SheetTrigger = forwardRef<HTMLDivElement, SheetTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    return (
      <Box ref={ref} onClick={onClick} sx={{ display: 'inline-flex', cursor: 'pointer' }} {...props}>
        {children}
      </Box>
    )
  }
)
SheetTrigger.displayName = 'SheetTrigger'

// SheetContent
interface SheetContentProps {
  children: ReactNode
  className?: string
  side?: 'left' | 'right' | 'top' | 'bottom'
  onClose?: () => void
}

const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(
  ({ children, side = 'right', onClose, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          p: 3,
          position: 'relative',
        }}
        {...props}
      >
        {onClose && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
        {children}
      </Box>
    )
  }
)
SheetContent.displayName = 'SheetContent'

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
const SheetDescription = forwardRef<HTMLParagraphElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Typography ref={ref} variant="body2" color="text.secondary" {...props}>
        {children}
      </Typography>
    )
  }
)
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
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetPortal,
  SheetOverlay,
  SheetClose,
}
