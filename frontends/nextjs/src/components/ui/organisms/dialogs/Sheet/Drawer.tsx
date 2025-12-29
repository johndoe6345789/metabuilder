'use client'

import CloseIcon from '@mui/icons-material/Close'
import { Box, Drawer, DrawerProps, IconButton } from '@mui/material'
import { forwardRef, ReactNode, SyntheticEvent } from 'react'

interface SheetProps extends Omit<DrawerProps, 'anchor'> {
  children: ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  onOpenChange?: (open: boolean) => void
}

const Sheet = forwardRef<HTMLDivElement, SheetProps>(
  ({ children, side = 'right', open, onClose, onOpenChange, ...props }, ref) => {
    const handleClose = (
      _event: SyntheticEvent | object,
      reason: 'backdropClick' | 'escapeKeyDown'
    ) => {
      if (typeof onClose === 'function') {
        onClose(_event, reason)
      }
      onOpenChange?.(false)
    }
    return (
      <Drawer ref={ref} anchor={side} open={open} onClose={handleClose} {...props}>
        {children}
      </Drawer>
    )
  }
)
Sheet.displayName = 'Sheet'

interface SheetTriggerProps {
  children: ReactNode
  onClick?: () => void
  asChild?: boolean
}

const SheetTrigger = forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ children, onClick, asChild, ...props }, ref) => {
    return (
      <Box ref={ref} component="span" onClick={onClick} sx={{ cursor: 'pointer' }} {...props}>
        {children}
      </Box>
    )
  }
)
SheetTrigger.displayName = 'SheetTrigger'

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

interface SheetCloseProps {
  children: ReactNode
  onClick?: () => void
  asChild?: boolean
}

const SheetClose = forwardRef<HTMLButtonElement, SheetCloseProps>(
  ({ children, onClick, ...props }, ref) => {
    return (
      <Box ref={ref} component="span" onClick={onClick} sx={{ cursor: 'pointer' }} {...props}>
        {children}
      </Box>
    )
  }
)
SheetClose.displayName = 'SheetClose'

export { Sheet, SheetClose, SheetContent, SheetTrigger }
