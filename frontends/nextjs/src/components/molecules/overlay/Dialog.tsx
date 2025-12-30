'use client'

import { forwardRef, ReactNode } from 'react'

import {
  Box,
  DialogActions,
  DialogContent as FakeMuiDialogContent,
  DialogTitle as FakeMuiDialogTitle,
  IconButton,
  Modal,
  Slide,
  Typography,
} from '@/fakemui'
import { Close } from '@/fakemui/icons'

// Dialog
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
      <Modal open={open} onClose={handleClose} className={className} {...props}>
        <Slide direction="up" in={open}>
          <div ref={ref} className="dialog-panel">{children}</div>
        </Slide>
      </Modal>
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
        className="dialog-trigger"
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
  ({ children, showCloseButton = true, onClose, className, ...props }, ref) => {
    return (
      <FakeMuiDialogContent
        ref={ref}
        className={`dialog-content ${showCloseButton ? 'dialog-content--with-close' : ''} ${className || ''}`}
        {...props}
      >
        {showCloseButton && onClose && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            className="dialog-close-button"
          >
            <Close />
          </IconButton>
        )}
        {children}
      </FakeMuiDialogContent>
    )
  }
)
DialogContent.displayName = 'DialogContent'

// DialogHeader
const DialogHeader = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <Box ref={ref} className={`dialog-header ${className || ''}`} {...props}>
        {children}
      </Box>
    )
  }
)
DialogHeader.displayName = 'DialogHeader'

// DialogFooter
const DialogFooter = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <DialogActions ref={ref} className={`dialog-footer ${className || ''}`} {...props}>
        {children}
      </DialogActions>
    )
  }
)
DialogFooter.displayName = 'DialogFooter'

// DialogTitle
const DialogTitle = forwardRef<HTMLHeadingElement, { children: ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <FakeMuiDialogTitle ref={ref} className={`dialog-title ${className || ''}`} {...props}>
        {children}
      </FakeMuiDialogTitle>
    )
  }
)
DialogTitle.displayName = 'DialogTitle'

// DialogDescription
const DialogDescription = forwardRef<
  HTMLParagraphElement,
  { children: ReactNode; className?: string }
>(({ children, className, ...props }, ref) => {
  return (
    <Typography variant="body2" className={`dialog-description ${className || ''}`} {...props}>
      <span ref={ref}>{children}</span>
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
        onClick={onClick}
        className="dialog-close"
      >
        {children}
      </Box>
    )
  }
  return (
    <IconButton ref={ref} aria-label="close" onClick={onClick} {...props}>
      <Close />
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
