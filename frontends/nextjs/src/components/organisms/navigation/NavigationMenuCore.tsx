'use client'

import { forwardRef, ReactNode } from 'react'

import { Box } from '@/fakemui'

import styles from './NavigationMenuCore.module.scss'

// NavigationMenu container
export interface NavigationMenuProps {
  children: ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

const NavigationMenuCore = forwardRef<HTMLDivElement, NavigationMenuProps>(
  ({ children, className = '', orientation = 'horizontal', ...props }, ref) => {
    const orientationClass = orientation === 'horizontal' 
      ? styles.horizontal 
      : styles.vertical
    
    return (
      <Box
        ref={ref}
        className={`${styles.navigationMenu} ${orientationClass} ${className}`}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
NavigationMenuCore.displayName = 'NavigationMenuCore'

// NavigationMenuList
const NavigationMenuList = forwardRef<
  HTMLUListElement,
  { children: ReactNode; className?: string }
>(({ children, className = '', ...props }, ref) => {
  return (
    <Box
      ref={ref}
      component="ul"
      className={`${styles.navigationMenuList} ${className}`}
      {...props}
    >
      {children}
    </Box>
  )
})
NavigationMenuList.displayName = 'NavigationMenuList'

// NavigationMenuItem
interface NavigationMenuItemProps {
  children: ReactNode
  className?: string
}

const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <Box 
        ref={ref} 
        component="li" 
        className={`${styles.navigationMenuItem} ${className}`} 
        {...props}
      >
        {children}
      </Box>
    )
  }
)
NavigationMenuItem.displayName = 'NavigationMenuItem'

export { NavigationMenuCore, NavigationMenuItem, NavigationMenuList }
