// TODO: Split this file (268 LOC) into smaller organisms (<150 LOC each)
'use client'

import { forwardRef, ReactNode } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

// AlertDialog Root
interface AlertDialogProps {
  open: boolean
  onClose?: () => void
  onOpenChange?: (open: boolean) => void
  children: ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
}

const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  ({ open, onClose, onOpenChange, children, maxWidth = 'sm', fullWidth = true, ...props }, ref) => {
    const handleClose = () => {
      onClose?.()
      onOpenChange?.(false)
    }
    return (
      <Dialog
        ref={ref}
        open={open}
        onClose={handleClose}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        {...props}
      >
        {children}
      </Dialog>
    )
  }
)
AlertDialog.displayName = 'AlertDialog'

// AlertDialogTrigger - element that opens dialog
interface AlertDialogTriggerProps {
  children: ReactNode
  onClick?: () => void
  asChild?: boolean
}

const AlertDialogTrigger = forwardRef<HTMLSpanElement, AlertDialogTriggerProps>(
  ({ children, onClick, asChild, ...props }, ref) => {
    return (
      <span ref={ref} onClick={onClick} style={{ cursor: 'pointer' }} {...props}>
        {children}
      </span>
    )
  }
)
AlertDialogTrigger.displayName = 'AlertDialogTrigger'

// AlertDialogContent - wrapper for dialog content
interface AlertDialogContentProps {
  children: ReactNode
  showCloseButton?: boolean
  onClose?: () => void
  className?: string
}

const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ children, showCloseButton = false, onClose, className, ...props }, ref) => {
    return (
      <>
        {showCloseButton && onClose && (
          <IconButton
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
      </>
    )
  }
)
AlertDialogContent.displayName = 'AlertDialogContent'

// AlertDialogHeader
interface AlertDialogHeaderProps {
  children: ReactNode
  icon?: 'warning' | 'error' | 'info' | 'success' | ReactNode
}

const AlertDialogHeader = forwardRef<HTMLDivElement, AlertDialogHeaderProps>(
  ({ children, icon, ...props }, ref) => {
    const getIcon = () => {
      if (!icon) return null
      if (typeof icon !== 'string') return icon

      const iconMap = {
        warning: <WarningAmberIcon color="warning" sx={{ fontSize: 40 }} />,
        error: <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />,
        info: <InfoOutlinedIcon color="info" sx={{ fontSize: 40 }} />,
        success: <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40 }} />,
      }
      return iconMap[icon]
    }

    const iconElement = getIcon()

    return (
      <DialogTitle
        ref={ref}
        id="alert-dialog-title"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: iconElement ? 'center' : 'flex-start',
          gap: 1,
          pt: 3,
          pb: 0,
        }}
        {...props}
      >
        {iconElement}
        {children}
      </DialogTitle>
    )
  }
)
AlertDialogHeader.displayName = 'AlertDialogHeader'

// AlertDialogTitle
interface AlertDialogTitleProps {
  children: ReactNode
  className?: string
}

const AlertDialogTitle = forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Typography
        ref={ref}
        variant="h6"
        component="span"
        className={className}
        sx={{
          fontWeight: 600,
          textAlign: 'inherit',
        }}
        {...props}
      >
        {children}
      </Typography>
    )
  }
)
AlertDialogTitle.displayName = 'AlertDialogTitle'

// AlertDialogDescription
interface AlertDialogDescriptionProps {
  children: ReactNode
  className?: string
}

const AlertDialogDescription = forwardRef<HTMLDivElement, AlertDialogDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <DialogContent ref={ref} className={className} sx={{ pt: 2 }} {...props}>
        <DialogContentText id="alert-dialog-description">
          {children}
        </DialogContentText>
      </DialogContent>
    )
  }
)
AlertDialogDescription.displayName = 'AlertDialogDescription'

// AlertDialogFooter
interface AlertDialogFooterProps {
  children: ReactNode
}

const AlertDialogFooter = forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  ({ children, ...props }, ref) => {
    return (
      <DialogActions ref={ref} sx={{ p: 2, pt: 0 }} {...props}>
        {children}
      </DialogActions>
    )
  }
)
AlertDialogFooter.displayName = 'AlertDialogFooter'

// AlertDialogCancel
interface AlertDialogCancelProps {
  children?: ReactNode
  onClick?: () => void
  className?: string
}

const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  ({ children = 'Cancel', onClick, className, ...props }, ref) => {
    return (
      <Button ref={ref} onClick={onClick} color="inherit" className={className} {...props}>
        {children}
      </Button>
    )
  }
)
AlertDialogCancel.displayName = 'AlertDialogCancel'

// AlertDialogAction
interface AlertDialogActionProps {
  children?: ReactNode
  onClick?: () => void
  color?: 'primary' | 'error' | 'warning' | 'success' | 'info'
  variant?: 'text' | 'outlined' | 'contained'
  autoFocus?: boolean
  className?: string
}

const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ children = 'Confirm', onClick, color = 'primary', variant = 'contained', autoFocus = true, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        color={color}
        variant={variant}
        autoFocus={autoFocus}
        className={className}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
AlertDialogAction.displayName = 'AlertDialogAction'

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
}
