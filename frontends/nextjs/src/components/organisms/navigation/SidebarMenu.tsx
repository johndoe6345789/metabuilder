'use client'

import { forwardRef, ReactNode } from 'react'

import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@/fakemui'

import styles from './SidebarMenu.module.scss'

// SidebarMenu (alias for List)
const SidebarMenu = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <Box ref={ref} className={className} {...props}>
        <List dense className={styles.sidebarMenuList}>
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
  ({ children, icon, label, href, active, disabled, onClick, className = '', ...props }, ref) => {
    const content = children || label
    const activeClass = active ? styles.active : ''

    const buttonContent = (
      <>
        {icon && <ListItemIcon className={styles.sidebarMenuIcon}>{icon}</ListItemIcon>}
        <ListItemText primary={content} className={styles.sidebarMenuText} />
      </>
    )

    return (
      <ListItem className={styles.sidebarMenuListItem}>
        <Box ref={ref} className={`${styles.sidebarMenuItemWrapper} ${className}`} {...props}>
          {href ? (
            <a
              href={href}
              onClick={onClick}
              className={`${styles.sidebarMenuButton} ${activeClass} ${disabled ? styles.disabled : ''}`}
              aria-disabled={disabled}
            >
              {buttonContent}
            </a>
          ) : (
            <ListItemButton
              selected={active}
              disabled={disabled}
              onClick={onClick}
              className={`${styles.sidebarMenuButton} ${activeClass}`}
            >
              {buttonContent}
            </ListItemButton>
          )}
        </Box>
      </ListItem>
    )
  }
)
SidebarMenuItem.displayName = 'SidebarMenuItem'

// SidebarMenuButton (alias for ListItemButton)
const SidebarMenuButton = forwardRef<HTMLDivElement, SidebarMenuItemProps>((props, ref) => (
  <SidebarMenuItem ref={ref} {...props} />
))
SidebarMenuButton.displayName = 'SidebarMenuButton'

export { SidebarMenu, SidebarMenuButton, SidebarMenuItem }
