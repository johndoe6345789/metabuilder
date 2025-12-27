import { forwardRef, ReactNode } from 'react'
import { Box, IconButton } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'

interface SidebarHeaderProps {
  children?: ReactNode
  onClose?: () => void
  showCloseButton?: boolean
}

const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ children, onClose, showCloseButton = false, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          minHeight: 64,
        }}
        {...props}
      >
        {children}
        {showCloseButton && onClose && (
          <IconButton onClick={onClose} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
    )
  }
)
SidebarHeader.displayName = 'SidebarHeader'

export { SidebarHeader }
export type { SidebarHeaderProps }
