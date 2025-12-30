'use client'

import { Menu as MenuIcon } from '@/fakemui/icons'
import { Box, Drawer, IconButton, useMediaQuery } from '@/fakemui'
import { forwardRef, ReactNode } from 'react'

import { MenuItemList, type MenuItemListProps, type SidebarItem } from './MenuItemList'
import { SidebarHeader, type SidebarHeaderProps } from './Sidebar/Header'
import { SidebarSection, SidebarSeparator } from './Sidebar/NavSections'
import styles from './Navigation.module.scss'

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
    // Use media query to determine mobile vs desktop
    const isMobile = useMediaQuery('(max-width: 959px)')
    const actualVariant = isMobile ? 'temporary' : variant

    return (
      <Drawer
        ref={ref}
        variant={actualVariant}
        anchor={anchor}
        open={open}
        onClose={onClose}
        className={styles.sidebar}
        style={{ 
          '--sidebar-width': `${width}px`,
          width: open ? width : 0 
        } as React.CSSProperties}
        {...props}
      >
        <div className={styles.sidebarPaper} style={{ width }}>
          {children}
        </div>
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
      className={styles.sidebarContent}
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
      className={styles.sidebarFooter}
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
    <IconButton ref={ref} onClick={onClick} {...props}>
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
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarSection,
  SidebarSeparator,
  SidebarToggle,
}
export type { SidebarHeaderProps, SidebarItem, SidebarProps }
