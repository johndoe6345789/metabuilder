'use client'

import CloseIcon from '@mui/icons-material/Close'
import { Box, Drawer as MuiDrawer, DrawerProps as MuiDrawerProps, IconButton } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

// Sheet (side panel drawer)
export interface SheetProps extends Omit<MuiDrawerProps, 'onClose'> {
  side?: 'left' | 'right' | 'top' | 'bottom'
  onOpenChange?: (open: boolean) => void
}

const SheetCore = forwardRef<HTMLDivElement, SheetProps>(
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
SheetCore.displayName = 'SheetCore'

// SheetTrigger
interface SheetTriggerProps {
  children: ReactNode
  asChild?: boolean
  onClick?: () => void
}

const SheetTrigger = forwardRef<HTMLDivElement, SheetTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        onClick={onClick}
        sx={{ display: 'inline-flex', cursor: 'pointer' }}
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

export { SheetContent,SheetCore, SheetTrigger }
