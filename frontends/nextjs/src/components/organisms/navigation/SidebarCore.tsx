'use client'

import { Box, Drawer, useMediaQuery,useTheme } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

// Sidebar container
export interface SidebarProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  width?: number
  collapsedWidth?: number
  variant?: 'permanent' | 'persistent' | 'temporary'
  side?: 'left' | 'right'
}

const SidebarCore = forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      children,
      open = true,
      onOpenChange,
      width = 280,
      collapsedWidth = 64,
      variant = 'permanent',
      side = 'left',
      ...props
    },
    ref
  ) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    if (isMobile || variant === 'temporary') {
      return (
        <Drawer
          ref={ref}
          anchor={side}
          open={open}
          onClose={() => onOpenChange?.(false)}
          PaperProps={{
            sx: { width },
          }}
          {...props}
        >
          {children}
        </Drawer>
      )
    }

    return (
      <Box
        ref={ref}
        component="nav"
        sx={{
          width: open ? width : collapsedWidth,
          flexShrink: 0,
          transition: 'width 0.2s',
          overflow: 'hidden',
        }}
        {...props}
      >
        <Box
          sx={{
            width,
            height: '100%',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
      </Box>
    )
  }
)
SidebarCore.displayName = 'SidebarCore'

export { SidebarCore }
