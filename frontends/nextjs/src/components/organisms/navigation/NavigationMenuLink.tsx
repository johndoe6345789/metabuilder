'use client'

import { forwardRef, ReactNode } from 'react'

import { Box, Button } from '@/fakemui'

import styles from './NavigationMenuLink.module.scss'

// NavigationMenuLink
interface NavigationMenuLinkProps {
  children: ReactNode
  href?: string
  active?: boolean
  onClick?: () => void
  className?: string
}

const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ children, href, active, onClick, className = '', ...props }, ref) => {
    const activeClass = active ? styles.active : ''
    
    // Use anchor element if href is provided
    if (href) {
      return (
        <a
          ref={ref}
          href={href}
          onClick={onClick}
          className={`${styles.navigationMenuLink} ${activeClass} ${className}`}
          {...props}
        >
          {children}
        </a>
      )
    }
    
    return (
      <Button
        ref={ref as React.Ref<HTMLButtonElement>}
        onClick={onClick}
        variant="ghost"
        className={`${styles.navigationMenuLink} ${activeClass} ${className}`}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
NavigationMenuLink.displayName = 'NavigationMenuLink'

// NavigationMenuIndicator
const NavigationMenuIndicator = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className = '', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={`${styles.navigationMenuIndicator} ${className}`}
        {...props}
      />
    )
  }
)
NavigationMenuIndicator.displayName = 'NavigationMenuIndicator'

// NavigationMenuViewport
const NavigationMenuViewport = forwardRef<
  HTMLDivElement,
  { children?: ReactNode; className?: string }
>(({ children, className = '', ...props }, ref) => {
  return (
    <Box
      ref={ref}
      className={`${styles.navigationMenuViewport} ${className}`}
      {...props}
    >
      {children}
    </Box>
  )
})
NavigationMenuViewport.displayName = 'NavigationMenuViewport'

// Helper: navigationMenuTriggerStyle (returns className for consistent styling)
const navigationMenuTriggerStyle = () => styles.triggerStyle

export {
  NavigationMenuIndicator,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
}
