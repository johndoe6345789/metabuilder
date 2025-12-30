'use client'

import { Close as CloseIcon } from '@/fakemui/icons'
import { Box } from '@/fakemui/fakemui/layout'
import { Drawer } from '@/fakemui/fakemui/surfaces'
import { IconButton } from '@/fakemui/fakemui/inputs'
import { forwardRef, ReactNode } from 'react'

import styles from './Drawer.module.scss'

interface SheetProps {
  children: ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  open?: boolean
  onClose?: () => void
  onOpenChange?: (open: boolean) => void
}

const Sheet = forwardRef<HTMLDivElement, SheetProps>(
  ({ children, side = 'right', open, onClose, onOpenChange, ...props }, ref) => {
    const handleClose = () => {
      onClose?.()
      onOpenChange?.(false)
    }
    return (
      <Drawer anchor={side} open={open} onClose={handleClose} {...props}>
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
      <Box component="span" onClick={onClick} className={styles.trigger} {...props}>
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
  ({ children, side = 'right', onClose, showCloseButton = true, className, ...props }, ref) => {
    const isHorizontal = side === 'left' || side === 'right'

    return (
      <Box
        ref={ref}
        className={`${styles.content} ${isHorizontal ? styles.horizontal : styles.vertical} ${className || ''}`}
        {...props}
      >
        {showCloseButton && (
          <IconButton
            onClick={onClose}
            className={styles.closeButton}
            sm
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

interface SheetCloseProps {
  children: ReactNode
  onClick?: () => void
  asChild?: boolean
}

const SheetClose = forwardRef<HTMLButtonElement, SheetCloseProps>(
  ({ children, onClick, ...props }, ref) => {
    return (
      <Box component="span" onClick={onClick} className={styles.close} {...props}>
        {children}
      </Box>
    )
  }
)
SheetClose.displayName = 'SheetClose'

export { Sheet, SheetClose, SheetContent, SheetTrigger }
