'use client'

import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Dialog as MuiDialog,
  DialogActions as MuiDialogActions,
  DialogContent as MuiDialogContent,
  DialogProps as MuiDialogProps,
  DialogTitle as MuiDialogTitle,
  IconButton,
  Slide,
  Typography,
} from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import { forwardRef, ReactNode, useState } from 'react'

// Slide transition
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

// Dialog
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
        TransitionComponent={Transition}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
        {...props}
      >
        {children}
      </MuiDialog>
    )
  }
)
Dialog.displayName = 'Dialog'

// DialogTrigger
interface DialogTriggerProps {
  children: ReactNode
  asChild?: boolean
  onClick?: () => void
}

const DialogTrigger = forwardRef<HTMLDivElement, DialogTriggerProps>(
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
DialogTrigger.displayName = 'DialogTrigger'

// DialogContent
interface DialogContentProps {
  children: ReactNode
  className?: string
  onClose?: () => void
  showCloseButton?: boolean
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, showCloseButton = true, onClose, ...props }, ref) => {
    return (
      <MuiDialogContent
        ref={ref}
        sx={{ position: 'relative', pt: showCloseButton ? 6 : 2 }}
        {...props}
      >
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
const DialogHeader = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pb: 2 }} {...props}>
        {children}
      </Box>
    )
  }
)
DialogHeader.displayName = 'DialogHeader'

// DialogFooter
const DialogFooter = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <MuiDialogActions ref={ref} sx={{ px: 3, py: 2, gap: 1 }} {...props}>
        {children}
      </MuiDialogActions>
    )
  }
)
DialogFooter.displayName = 'DialogFooter'

// DialogTitle
const DialogTitle = forwardRef<HTMLHeadingElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <MuiDialogTitle ref={ref} sx={{ pb: 1 }} {...props}>
        {children}
      </MuiDialogTitle>
    )
  }
)
DialogTitle.displayName = 'DialogTitle'

// DialogDescription
const DialogDescription = forwardRef<
  HTMLParagraphElement,
  { children: ReactNode; className?: string }
>(({ children, ...props }, ref) => {
  return (
    <Typography ref={ref} variant="body2" color="text.secondary" {...props}>
      {children}
    </Typography>
  )
})
DialogDescription.displayName = 'DialogDescription'

// DialogClose
const DialogClose = forwardRef<
  HTMLButtonElement,
  { children?: ReactNode; onClick?: () => void; asChild?: boolean }
>(({ children, onClick, ...props }, ref) => {
  if (children) {
    return (
      <Box
        ref={ref as unknown as React.Ref<HTMLDivElement>}
        onClick={onClick}
        sx={{ display: 'inline-flex', cursor: 'pointer' }}
      >
        {children}
      </Box>
    )
  }
  return (
    <IconButton ref={ref} aria-label="close" onClick={onClick} {...props}>
      <CloseIcon />
    </IconButton>
  )
})
DialogClose.displayName = 'DialogClose'

// Compatibility exports
const DialogPortal = ({ children }: { children: ReactNode }) => <>{children}</>
const DialogOverlay = forwardRef<HTMLDivElement>((props, ref) => <div ref={ref} {...props} />)
DialogOverlay.displayName = 'DialogOverlay'

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
