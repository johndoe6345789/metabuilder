'use client'

import { forwardRef, ReactNode } from 'react'
import { Box, Drawer, IconButton, useMediaQuery, useTheme } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

import { MenuItemList, type MenuItemListProps, type SidebarItem } from './MenuItemList'
import { SidebarHeader, type SidebarHeaderProps } from './Sidebar/Header'
import { SidebarSection, SidebarSeparator } from './Sidebar/NavSections'

interface SidebarProps {
  children?: ReactNode
  open?: boolean
  onClose?: () => void
  width?: number
  variant?: 'permanent' | 'persistent' | 'temporary'
  anchor?: 'left' | 'right'
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      children,
      open = true,
      onClose,
      width = 280,
      variant = 'permanent',
      anchor = 'left',
      ...props
    },
    ref
  ) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const actualVariant = isMobile ? 'temporary' : variant

    return (
      <Drawer
        ref={ref}
        variant={actualVariant}
        anchor={anchor}
        open={open}
        onClose={onClose}
        sx={{
          width: open ? width : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: width,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
        {...props}
      >
        {children}
      </Drawer>
    )
  }
)
Sidebar.displayName = 'Sidebar'

interface SidebarContentProps {
  children: ReactNode
}

const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ children, ...props }, ref) => (
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
)
SidebarContent.displayName = 'SidebarContent'

interface SidebarFooterProps {
  children: ReactNode
}

const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ children, ...props }, ref) => (
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
)
SidebarFooter.displayName = 'SidebarFooter'

interface SidebarToggleProps {
  onClick: () => void
}

const SidebarToggle = forwardRef<HTMLButtonElement, SidebarToggleProps>(
  ({ onClick, ...props }, ref) => (
    <IconButton ref={ref} onClick={onClick} edge="start" {...props}>
      <MenuIcon />
    </IconButton>
  )
)
SidebarToggle.displayName = 'SidebarToggle'

const SidebarNav = forwardRef<HTMLUListElement, MenuItemListProps>((props, ref) => (
  <MenuItemList ref={ref} {...props} />
))
SidebarNav.displayName = 'SidebarNav'

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarSection,
  SidebarSeparator,
  SidebarToggle,
}
export type { SidebarItem, SidebarProps, SidebarHeaderProps }
