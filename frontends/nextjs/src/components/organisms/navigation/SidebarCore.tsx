'use client'

import { forwardRef, ReactNode } from 'react'

import { Box, Drawer, useMediaQueryDown } from '@/fakemui'

import styles from './SidebarCore.module.scss'

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
    const isMobile = useMediaQueryDown('md')

    if (isMobile || variant === 'temporary') {
      return (
        <Drawer
          ref={ref}
          anchor={side}
          open={open}
          onClose={() => onOpenChange?.(false)}
          className={styles.sidebarDrawer}
          style={{ '--sidebar-width': `${width}px` } as React.CSSProperties}
          {...props}
        >
          {children}
        </Drawer>
      )
    }

    const sidebarWidth = open ? width : collapsedWidth
    const openClass = open ? styles.open : styles.collapsed

    return (
      <Box
        ref={ref}
        component="nav"
        className={`${styles.sidebarCore} ${openClass}`}
        style={{ '--sidebar-width': `${sidebarWidth}px`, '--sidebar-inner-width': `${width}px` } as React.CSSProperties}
        {...props}
      >
        <Box className={styles.sidebarInner}>
          {children}
        </Box>
      </Box>
    )
  }
)
SidebarCore.displayName = 'SidebarCore'

export { SidebarCore }
