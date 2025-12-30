'use client'

import { forwardRef, ReactNode } from 'react'

import { Box } from '@/fakemui/fakemui/layout'
import { Typography } from '@/fakemui/fakemui/data-display'
import { IconButton } from '@/fakemui/fakemui/inputs'
import {
  Dialog as FakeMuiDialog,
  DialogTitle as FakeMuiDialogTitle,
} from '@/fakemui/fakemui/utils'
import { Close } from '@/fakemui/icons'

import { DialogContent, type DialogContentProps } from './dialog/Body'
import { DialogFooter, type DialogFooterProps } from './dialog/Footer'
import { DialogHeader, type DialogHeaderProps } from './dialog/Header'

import styles from './Dialog.module.scss'

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  children?: ReactNode
  className?: string
}

const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ open, onOpenChange, onClose, children, className, ...props }, ref) => {
    const handleClose = () => {
      onClose?.()
      onOpenChange?.(false)
    }

    return (
      <FakeMuiDialog ref={ref} open={open ?? false} onClose={handleClose} className={className} {...props}>
        {children}
      </FakeMuiDialog>
    )
  }
)
Dialog.displayName = 'Dialog'

interface DialogTriggerProps {
  children: ReactNode
  asChild?: boolean
  onClick?: () => void
}

const DialogTrigger = forwardRef<HTMLDivElement, DialogTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    return (
      <Box ref={ref} onClick={onClick} className={styles.trigger} {...props}>
        {children}
      </Box>
    )
  }
)
DialogTrigger.displayName = 'DialogTrigger'

const DialogPortal = ({ children }: { children: ReactNode }) => <>{children}</>
DialogPortal.displayName = 'DialogPortal'

const DialogOverlay = forwardRef<HTMLDivElement>((props, ref) => <div ref={ref} {...props} />)
DialogOverlay.displayName = 'DialogOverlay'

interface DialogCloseProps {
  children?: ReactNode
  onClick?: () => void
  asChild?: boolean
}

const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, onClick, ...props }, ref) => {
    if (children) {
      return (
        <Box
          ref={ref as unknown as React.Ref<HTMLDivElement>}
          onClick={onClick}
          className={styles.trigger}
          {...props}
        >
          {children}
        </Box>
      )
    }
    return (
      <IconButton
        ref={ref}
        aria-label="close"
        onClick={onClick}
        className={styles.closeButton}
        {...props}
      >
        <Close />
      </IconButton>
    )
  }
)
DialogClose.displayName = 'DialogClose'

interface DialogTitleProps {
  children: ReactNode
  className?: string
}

const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>((props, ref) => {
  const { children, ...rest } = props
  return (
    <FakeMuiDialogTitle ref={ref} {...rest}>
      {children}
    </FakeMuiDialogTitle>
  )
})
DialogTitle.displayName = 'DialogTitle'

interface DialogDescriptionProps {
  children: ReactNode
  className?: string
}

const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>((props, ref) => {
  const { children, className, ...rest } = props
  return (
    <Typography
      ref={ref}
      variant="body2"
      className={`${styles.description} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </Typography>
  )
})
DialogDescription.displayName = 'DialogDescription'

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}

export type { DialogContentProps, DialogFooterProps, DialogHeaderProps }
