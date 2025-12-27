'use client'

import { forwardRef, ReactNode } from 'react'
import { Box, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface SheetContentProps {
  children: ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  onClose?: () => void
  showCloseButton?: boolean
  className?: string
}

const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(
  ({ children, side = 'right', onClose, showCloseButton = true, ...props }, ref) => {
    const isHorizontal = side === 'left' || side === 'right'

    return (
      <Box
        ref={ref}
        sx={{
          width: isHorizontal ? 320 : '100%',
          height: isHorizontal ? '100%' : 'auto',
          maxHeight: !isHorizontal ? '80vh' : undefined,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          bgcolor: 'background.paper',
        }}
        {...props}
      >
        {showCloseButton && (
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'text.secondary',
            }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
        {children}
      </Box>
    )
  }
)

SheetContent.displayName = 'SheetContent'

export { SheetContent }
export type { SheetContentProps }
