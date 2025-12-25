'use client'

import { forwardRef, ReactNode } from 'react'
import {
  Drawer,
  DrawerProps,
  Box,
  IconButton,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

// Sheet (Drawer) Root Component
interface SheetProps extends Omit<DrawerProps, 'anchor'> {
  children: ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
}

const Sheet = forwardRef<HTMLDivElement, SheetProps>(
  ({ children, side = 'right', open, onClose, ...props }, ref) => {
    return (
      <Drawer
        ref={ref}
        anchor={side}
        open={open}
        onClose={onClose}
        {...props}
      >
        {children}
      </Drawer>
    )
  }
)
Sheet.displayName = 'Sheet'

// SheetTrigger - returns children with onClick handler
interface SheetTriggerProps {
  children: ReactNode
  onClick?: () => void
  asChild?: boolean
}

const SheetTrigger = forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ children, onClick, asChild, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="span"
        onClick={onClick}
        sx={{ cursor: 'pointer' }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
SheetTrigger.displayName = 'SheetTrigger'

// SheetContent
interface SheetContentProps {
  children: ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  onClose?: () => void
  showCloseButton?: boolean
  className?: string
}

const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(
  ({ children, side = 'right', onClose, showCloseButton = true, ...props }, ref) => {
    const isHorizontal = side === 'left' || side === 'right'
    
    return (
      <Box
        ref={ref}
        sx={{
          width: isHorizontal ? 320 : '100%',
          height: isHorizontal ? '100%' : 'auto',
          maxHeight: !isHorizontal ? '80vh' : undefined,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          bgcolor: 'background.paper',
        }}
        {...props}
      >
        {showCloseButton && (
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'text.secondary',
            }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
        {children}
      </Box>
    )
  }
)
SheetContent.displayName = 'SheetContent'

// SheetHeader
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

// SheetFooter
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

// SheetTitle
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

// SheetDescription
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

// SheetClose - button to close sheet
interface SheetCloseProps {
  children: ReactNode
  onClick?: () => void
  asChild?: boolean
}

const SheetClose = forwardRef<HTMLButtonElement, SheetCloseProps>(
  ({ children, onClick, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="span"
        onClick={onClick}
        sx={{ cursor: 'pointer' }}
        {...props}
      >
        {children}
      </Box>
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
  SheetClose,
}
