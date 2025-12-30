'use client'

import { forwardRef, ReactNode } from 'react'

import { Box, Divider, IconButton } from '@/fakemui'
import { Menu } from '@/fakemui/icons'

import styles from './SidebarExtras.module.scss'

// SidebarSeparator
const SidebarSeparator = forwardRef<HTMLHRElement, { className?: string }>(
  ({ className = '', ...props }, ref) => {
    return <Divider ref={ref} className={`${styles.sidebarSeparator} ${className}`} {...props} />
  }
)
SidebarSeparator.displayName = 'SidebarSeparator'

// SidebarTrigger
interface SidebarTriggerProps {
  onClick?: () => void
  className?: string
}

const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ onClick, className = '', ...props }, ref) => {
    return (
      <IconButton ref={ref} onClick={onClick} sm className={`${styles.sidebarTrigger} ${className}`} {...props}>
        <Menu />
      </IconButton>
    )
  }
)
SidebarTrigger.displayName = 'SidebarTrigger'

// SidebarRail
const SidebarRail = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className = '', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={`${styles.sidebarRail} ${className}`}
        {...props}
      />
    )
  }
)
SidebarRail.displayName = 'SidebarRail'

// SidebarProvider
const SidebarProvider = ({ children }: { children: ReactNode }) => <>{children}</>
SidebarProvider.displayName = 'SidebarProvider'

export { SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger }
