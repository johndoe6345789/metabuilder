'use client'

import { forwardRef, ReactNode } from 'react'
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  DialogProps as MuiDialogProps,
  IconButton,
  Typography,
  Box,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

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
      <MuiDialog
        ref={ref}
        open={open ?? false}
        onClose={handleClose}
        {...props}
      >
        {children}
      </MuiDialog>
    )
  }
)
Dialog.displayName = 'Dialog'

// DialogTrigger - MUI doesn't have a trigger pattern, so this is a simple wrapper
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

// DialogPortal - Not needed in MUI, just renders children
const DialogPortal = ({ children }: { children: ReactNode }) => <>{children}</>
DialogPortal.displayName = 'DialogPortal'

// DialogOverlay - Not needed in MUI, built into Dialog
const DialogOverlay = forwardRef<HTMLDivElement>((props, ref) => <div ref={ref} {...props} />)
DialogOverlay.displayName = 'DialogOverlay'

// DialogClose
interface DialogCloseProps {
  children?: ReactNode
  onClick?: () => void
  asChild?: boolean
}

const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, onClick, ...props }, ref) => {
    if (children) {
      return (
        <Box ref={ref as React.Ref<HTMLDivElement>} onClick={onClick} sx={{ display: 'inline-flex' }} {...props}>
          {children}
        </Box>
      )
    }
    return (
      <IconButton
        ref={ref}
        aria-label="close"
        onClick={onClick}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'text.secondary',
        }}
        {...props}
      >
        <CloseIcon />
      </IconButton>
    )
  }
)
DialogClose.displayName = 'DialogClose'

// DialogContent with close button
interface DialogContentProps {
  children: ReactNode
  className?: string
  onClose?: () => void
  showCloseButton?: boolean
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, showCloseButton = true, onClose, ...props }, ref) => {
    return (
      <MuiDialogContent ref={ref} sx={{ position: 'relative', pt: showCloseButton ? 6 : 2 }} {...props}>
        {showCloseButton && onClose && (
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
      </MuiDialogContent>
    )
  }
)
DialogContent.displayName = 'DialogContent'

// DialogHeader
interface DialogHeaderProps {
  children: ReactNode
  className?: string
}

const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2 }} {...props}>
        {children}
      </Box>
    )
  }
)
DialogHeader.displayName = 'DialogHeader'

// DialogFooter
interface DialogFooterProps {
  children: ReactNode
  className?: string
}

const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiDialogActions ref={ref} sx={{ px: 3, py: 2 }} {...props}>
        {children}
      </MuiDialogActions>
    )
  }
)
DialogFooter.displayName = 'DialogFooter'

// DialogTitle
interface DialogTitleProps {
  children: ReactNode
  className?: string
}

const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiDialogTitle ref={ref} {...props}>
        {children}
      </MuiDialogTitle>
    )
  }
)
DialogTitle.displayName = 'DialogTitle'

// DialogDescription
interface DialogDescriptionProps {
  children: ReactNode
  className?: string
}

const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ children, ...props }, ref) => {
    return (
      <Typography ref={ref} variant="body2" color="text.secondary" {...props}>
        {children}
      </Typography>
    )
  }
)
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
