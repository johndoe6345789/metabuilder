'use client'

import { forwardRef, ReactNode } from 'react'

import { Button, Menu } from '@/fakemui'
import { KeyboardArrowDown } from '@/fakemui/icons'

import styles from './NavigationMenuTrigger.module.scss'

// NavigationMenuTrigger
interface NavigationMenuTriggerProps {
  children: ReactNode
  className?: string
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

const NavigationMenuTrigger = forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ children, className = '', onClick, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        variant="ghost"
        endIcon={<KeyboardArrowDown />}
        className={`${styles.navigationMenuTrigger} ${className}`}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
NavigationMenuTrigger.displayName = 'NavigationMenuTrigger'

// NavigationMenuContent
interface NavigationMenuContentProps {
  children: ReactNode
  className?: string
  anchorEl?: HTMLElement | null
  open?: boolean
  onClose?: () => void
}

const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ children, className = '', anchorEl: _anchorEl, open, onClose, ...props }, ref) => {
    return (
      <Menu
        ref={ref}
        open={open}
        onClose={onClose}
        className={`${styles.navigationMenuContent} ${className}`}
        {...props}
      >
        {children}
      </Menu>
    )
  }
)
NavigationMenuContent.displayName = 'NavigationMenuContent'

export { NavigationMenuContent, NavigationMenuTrigger }
