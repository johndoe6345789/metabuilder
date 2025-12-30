'use client'

import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  Close as CloseIcon,
  ErrorOutline as ErrorOutlineIcon,
  InfoOutlined as InfoOutlinedIcon,
  WarningAmber as WarningAmberIcon,
} from '@/fakemui/icons'
import {
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'
import { forwardRef, ReactNode } from 'react'

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

interface AlertDialogDescriptionProps {
  children: ReactNode
  className?: string
}

const AlertDialogDescription = forwardRef<HTMLDivElement, AlertDialogDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <DialogContent ref={ref} className={className} sx={{ pt: 2 }} {...props}>
        <DialogContentText id="alert-dialog-description">{children}</DialogContentText>
      </DialogContent>
    )
  }
)
AlertDialogDescription.displayName = 'AlertDialogDescription'

export { AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle }
