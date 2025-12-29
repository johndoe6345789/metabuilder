'use client'

import { Box } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

// SidebarHeader
const SidebarHeader = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
SidebarHeader.displayName = 'SidebarHeader'

// SidebarContent
const SidebarContent = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 1,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
SidebarContent.displayName = 'SidebarContent'

// SidebarFooter
const SidebarFooter = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
SidebarFooter.displayName = 'SidebarFooter'

// SidebarInset
const SidebarInset = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ flex: 1, overflow: 'auto' }} {...props}>
        {children}
      </Box>
    )
  }
)
SidebarInset.displayName = 'SidebarInset'

export { SidebarContent, SidebarFooter, SidebarHeader, SidebarInset }
