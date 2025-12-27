'use client'

import { forwardRef, ReactNode } from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'

// SidebarMenu (alias for List)
const SidebarMenu = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} {...props}>
        <List dense disablePadding>
          {children}
        </List>
      </Box>
    )
  }
)
SidebarMenu.displayName = 'SidebarMenu'

// SidebarMenuItem
interface SidebarMenuItemProps {
  children?: ReactNode
  icon?: ReactNode
  label?: string
  href?: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

const SidebarMenuItem = forwardRef<HTMLDivElement, SidebarMenuItemProps>(
  ({ children, icon, label, href, active, disabled, onClick, ...props }, ref) => {
    const content = children || label

    return (
      <ListItem disablePadding>
        <Box ref={ref} sx={{ width: '100%' }} {...props}>
        <ListItemButton
          selected={active}
          disabled={disabled}
          onClick={onClick}
          href={href}
          component={href ? 'a' : 'button'}
          sx={{
            mx: 1,
            borderRadius: 1,
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '& .MuiListItemIcon-root': {
                color: 'primary.contrastText',
              },
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            },
          }}
        >
          {icon && <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>}
          <ListItemText
            primary={content}
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
        </ListItemButton>
        </Box>
      </ListItem>
    )
  }
)
SidebarMenuItem.displayName = 'SidebarMenuItem'

// SidebarMenuButton (alias for ListItemButton)
const SidebarMenuButton = forwardRef<HTMLDivElement, SidebarMenuItemProps>(
  (props, ref) => <SidebarMenuItem ref={ref} {...props} />
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
}
