'use client'

import { forwardRef, ReactNode, useState } from 'react'

import { Box, Collapse, List, Typography } from '@/fakemui'
import { ExpandLess, ExpandMore } from '@/fakemui/icons'

import styles from './SidebarGroup.module.scss'

// SidebarGroup
interface SidebarGroupProps {
  children: ReactNode
  label?: string
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
}

const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ children, label, collapsible, defaultOpen = true, className = '', ...props }, ref) => {
    const [open, setOpen] = useState(defaultOpen)

    return (
      <Box ref={ref} className={`${styles.sidebarGroup} ${className}`} {...props}>
        {label && (
          <Box
            onClick={collapsible ? () => setOpen(!open) : undefined}
            className={`${styles.sidebarGroupHeader} ${collapsible ? styles.collapsible : ''}`}
          >
            <Typography
              variant="overline"
              className={styles.sidebarGroupLabel}
            >
              {label}
            </Typography>
            {collapsible &&
              (open ? <ExpandLess size={16} /> : <ExpandMore size={16} />)}
          </Box>
        )}
        {collapsible ? (
          <Collapse in={open}>
            <List dense className={styles.sidebarGroupList}>
              {children}
            </List>
          </Collapse>
        ) : (
          <List dense className={styles.sidebarGroupList}>
            {children}
          </List>
        )}
      </Box>
    )
  }
)
SidebarGroup.displayName = 'SidebarGroup'

// SidebarGroupLabel
const SidebarGroupLabel = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <Typography
        ref={ref}
        variant="overline"
        className={`${styles.sidebarGroupLabelStandalone} ${className}`}
        {...props}
      >
        {children}
      </Typography>
    )
  }
)
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

// SidebarGroupContent
const SidebarGroupContent = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <Box ref={ref} className={className} {...props}>
        <List dense className={styles.sidebarGroupList}>
          {children}
        </List>
      </Box>
    )
  }
)
SidebarGroupContent.displayName = 'SidebarGroupContent'

export { SidebarGroup, SidebarGroupContent, SidebarGroupLabel }
