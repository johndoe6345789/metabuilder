'use client'

import React, { forwardRef, ReactNode } from 'react'
import { Drawer, DrawerProps } from '@mui/material'

interface SheetProps extends Omit<DrawerProps, 'anchor'> {
  children: ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  onOpenChange?: (open: boolean) => void
}

const Sheet = forwardRef<HTMLDivElement, SheetProps>(
  ({ children, side = 'right', open, onClose, onOpenChange, ...props }, ref) => {
    const handleClose = (_event: React.SyntheticEvent | object, reason: 'backdropClick' | 'escapeKeyDown') => {
      if (typeof onClose === 'function') {
        onClose(_event, reason)
      }
      onOpenChange?.(false)
    }
    return (
      <Drawer
        ref={ref}
        anchor={side}
        open={open}
        onClose={handleClose}
        {...props}
      >
        {children}
      </Drawer>
    )
  }
)

Sheet.displayName = 'Sheet'

export { Sheet }
export type { SheetProps }
