'use client'

import { forwardRef, ReactNode } from 'react'
import { DialogTitle } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

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

export { AlertDialogHeader }
export type { AlertDialogHeaderProps }
