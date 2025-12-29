'use client'

import MenuIcon from '@mui/icons-material/Menu'
import { Box, Divider, IconButton } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

// SidebarSeparator
const SidebarSeparator = forwardRef<HTMLHRElement>((props, ref) => {
  return <Divider ref={ref} sx={{ my: 1 }} {...props} />
})
SidebarSeparator.displayName = 'SidebarSeparator'

// SidebarTrigger
interface SidebarTriggerProps {
  onClick?: () => void
  className?: string
}

const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ onClick, ...props }, ref) => {
    return (
      <IconButton ref={ref} onClick={onClick} size="small" {...props}>
        <MenuIcon />
      </IconButton>
    )
  }
)
SidebarTrigger.displayName = 'SidebarTrigger'

// SidebarRail
const SidebarRail = forwardRef<HTMLDivElement, { className?: string }>((props, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        position: 'absolute',
        right: -4,
        top: 0,
        bottom: 0,
        width: 8,
        cursor: 'col-resize',
        '&:hover': {
          bgcolor: 'primary.main',
          opacity: 0.2,
        },
      }}
      {...props}
    />
  )
})
SidebarRail.displayName = 'SidebarRail'

// SidebarProvider
const SidebarProvider = ({ children }: { children: ReactNode }) => <>{children}</>
SidebarProvider.displayName = 'SidebarProvider'

export { SidebarProvider,SidebarRail, SidebarSeparator, SidebarTrigger }
