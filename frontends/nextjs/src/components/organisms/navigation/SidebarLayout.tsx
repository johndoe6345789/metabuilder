'use client'

import { forwardRef, ReactNode } from 'react'

import { Box } from '@/fakemui'

import styles from './SidebarLayout.module.scss'

// SidebarHeader
const SidebarHeader = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={`${styles.sidebarHeader} ${className}`}
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
  ({ children, className = '', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={`${styles.sidebarContent} ${className}`}
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
  ({ children, className = '', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={`${styles.sidebarFooter} ${className}`}
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
  ({ children, className = '', ...props }, ref) => {
    return (
      <Box ref={ref} className={`${styles.sidebarInset} ${className}`} {...props}>
        {children}
      </Box>
    )
  }
)
SidebarInset.displayName = 'SidebarInset'

export { SidebarContent, SidebarFooter, SidebarHeader, SidebarInset }
