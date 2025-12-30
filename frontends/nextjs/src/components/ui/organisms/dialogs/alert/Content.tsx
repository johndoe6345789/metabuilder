'use client'

import { forwardRef, ReactNode } from 'react'

import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  Close as CloseIcon,
  ErrorOutline as ErrorOutlineIcon,
  InfoOutlined as InfoOutlinedIcon,
  WarningAmber as WarningAmberIcon,
} from '@/fakemui/icons'
import { DialogContent, DialogTitle, IconButton, Typography } from '@/fakemui'

interface AlertDialogContentProps {
  children: ReactNode
  showCloseButton?: boolean
  onClose?: () => void
  className?: string
}

const AlertDialogContent = ({
  children,
  showCloseButton = false,
  onClose,
  className,
  ...props
}: AlertDialogContentProps) => {
  return (
    <>
      {showCloseButton && onClose && (
        <IconButton
          onClick={onClose}
          className="alert-dialog-close"
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
      )}
      {children}
    </>
  )
}
AlertDialogContent.displayName = 'AlertDialogContent'

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
        warning: <WarningAmberIcon size={40} style={{ color: '#ed6c02' }} />,
        error: <ErrorOutlineIcon size={40} style={{ color: '#d32f2f' }} />,
        info: <InfoOutlinedIcon size={40} style={{ color: '#0288d1' }} />,
        success: <CheckCircleOutlineIcon size={40} style={{ color: '#2e7d32' }} />,
      }
      return iconMap[icon]
    }

    const iconElement = getIcon()

    return (
      <DialogTitle
        ref={ref}
        id="alert-dialog-title"
        className={`alert-dialog-header ${iconElement ? 'alert-dialog-header--with-icon' : ''}`}
        {...props}
      >
        {iconElement}
        {children}
      </DialogTitle>
    )
  }
)
AlertDialogHeader.displayName = 'AlertDialogHeader'

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
        as="span"
        className={`alert-dialog-title ${className || ''}`}
        {...props}
      >
        {children}
      </Typography>
    )
  }
)
AlertDialogTitle.displayName = 'AlertDialogTitle'

interface AlertDialogDescriptionProps {
  children: ReactNode
  className?: string
}

const AlertDialogDescription = forwardRef<HTMLDivElement, AlertDialogDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <DialogContent ref={ref} className={className} {...props}>
        <Typography variant="body2" id="alert-dialog-description">
          {children}
        </Typography>
      </DialogContent>
    )
  }
)
AlertDialogDescription.displayName = 'AlertDialogDescription'

export { AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle }
