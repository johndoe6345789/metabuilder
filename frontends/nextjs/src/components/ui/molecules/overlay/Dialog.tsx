'use client'

import {
  Box,
  Dialog as MuiDialog,
  DialogProps as MuiDialogProps,
  DialogTitle as MuiDialogTitle,
  IconButton,
  Typography,
} from '@mui/material'
import { forwardRef, ReactNode } from 'react'

import { Close } from '@/fakemui/icons'

import { DialogContent, type DialogContentProps } from './dialog/Body'
import { DialogFooter, type DialogFooterProps } from './dialog/Footer'
import { DialogHeader, type DialogHeaderProps } from './dialog/Header'

export interface DialogProps extends Omit<MuiDialogProps, 'onClose'> {
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
}

const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ open, onOpenChange, onClose, children, ...props }, ref) => {
    const handleClose = () => {
      onClose?.()
      onOpenChange?.(false)
    }

    return (
      <MuiDialog ref={ref} open={open ?? false} onClose={handleClose} {...props}>
        {children}
      </MuiDialog>
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
      <Box ref={ref} onClick={onClick} sx={{ display: 'inline-flex' }} {...props}>
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
          sx={{ display: 'inline-flex' }}
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
        sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
        {...props}
      >
        <CloseIcon />
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
    <MuiDialogTitle ref={ref} {...rest}>
      {children}
    </MuiDialogTitle>
  )
})
DialogTitle.displayName = 'DialogTitle'

interface DialogDescriptionProps {
  children: ReactNode
  className?: string
}

const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>((props, ref) => {
  const { children, ...rest } = props
  return (
    <Typography ref={ref} variant="body2" color="text.secondary" {...rest}>
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
