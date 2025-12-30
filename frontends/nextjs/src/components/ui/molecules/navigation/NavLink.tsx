'use client'

import { forwardRef, ReactNode } from 'react'

import { Box, Link } from '@/fakemui'

import styles from './NavLink.module.scss'

export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  active?: boolean
  disabled?: boolean
  children: ReactNode
  icon?: ReactNode
  className?: string
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ href, active = false, disabled = false, children, icon, className = '', ...props }, ref) => {
    const linkClasses = [
      styles.navLink,
      active && styles.navLinkActive,
      disabled && styles.navLinkDisabled,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const iconClasses = [styles.icon, active && styles.iconActive].filter(Boolean).join(' ')

    return (
      <Link
        ref={ref}
        href={disabled ? undefined : href}
        underline="none"
        className={linkClasses}
        {...props}
      >
        {icon && (
          <Box component="span" className={iconClasses}>
            {icon}
          </Box>
        )}
        {children}
      </Link>
    )
  }
)

NavLink.displayName = 'NavLink'

export { NavLink }
