'use client'

import { ComponentProps,forwardRef, ReactNode } from 'react'

import { Box, Drawer, IconButton } from '@/fakemui'
import { Close } from '@/fakemui/icons'

// Sheet (side panel drawer)
export interface SheetProps extends Omit<ComponentProps<typeof Drawer>, 'onClose'> {
  side?: 'left' | 'right' | 'top' | 'bottom'
  onOpenChange?: (open: boolean) => void
}

const SheetCore = forwardRef<HTMLDivElement, SheetProps>(
  ({ open, side = 'right', onOpenChange, children, className, ...props }, ref) => {
    const sideClass = `sheet--${side}`
    return (
      <Drawer
        ref={ref}
        anchor={side}
        open={open}
        onClose={() => onOpenChange?.(false)}
        className={`sheet ${sideClass} ${className || ''}`}
        {...props}
      >
        {children}
      </Drawer>
    )
  }
)
SheetCore.displayName = 'SheetCore'

// SheetTrigger
interface SheetTriggerProps {
  children: ReactNode
  asChild?: boolean
  onClick?: () => void
  className?: string
}

const SheetTrigger = forwardRef<HTMLDivElement, SheetTriggerProps>(
  ({ children, onClick, className, ...props }, ref) => {
    return (
      <Box ref={ref} onClick={onClick} className={`sheet-trigger ${className || ''}`} {...props}>
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
  ({ children, side = 'right', onClose, className, ...props }, ref) => {
    return (
      <Box ref={ref} className={`sheet-content ${className || ''}`} {...props}>
        {onClose && (
          <IconButton aria-label="close" onClick={onClose} className="sheet-close-button">
            <Close />
          </IconButton>
        )}
        {children}
      </Box>
    )
  }
)
SheetContent.displayName = 'SheetContent'

export { SheetContent, SheetCore, SheetTrigger }
