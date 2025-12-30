'use client'

import { ListItem, ListItemIcon, ListItemText } from '@/fakemui'
import { forwardRef, ReactNode } from 'react'

import styles from './NavItem.module.scss'

export interface NavItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  icon?: ReactNode
  label: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  badge?: number | string
  badgeColor?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  href?: string
  secondaryLabel?: string
  dense?: boolean
  className?: string
}

const badgeColorMap: Record<string, string> = {
  default: styles.badgeDefault,
  primary: styles.badgePrimary,
  secondary: styles.badgeSecondary,
  error: styles.badgeError,
  warning: styles.badgeWarning,
  info: styles.badgeInfo,
  success: styles.badgeSuccess,
}

const NavItem = forwardRef<HTMLLIElement, NavItemProps>(
  (
    {
      icon,
      label,
      onClick,
      active = false,
      disabled = false,
      badge,
      badgeColor = 'primary',
      href,
      secondaryLabel,
      dense = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const buttonClasses = [
      styles.navItemButton,
      active && styles.navItemButtonSelected,
      disabled && styles.navItemButtonDisabled,
      dense && styles.navItemButtonDense,
    ]
      .filter(Boolean)
      .join(' ')

    const iconClasses = [styles.icon, active && styles.iconActive].filter(Boolean).join(' ')

    const primaryTextClasses = [styles.textPrimary, active && styles.textPrimaryActive]
      .filter(Boolean)
      .join(' ')

    const badgeClasses = [styles.badge, badgeColorMap[badgeColor]].filter(Boolean).join(' ')

    const ButtonComponent = href ? 'a' : 'button'

    return (
      <ListItem ref={ref} className={`${styles.navItem} ${className}`} {...props}>
        <ButtonComponent
          className={buttonClasses}
          onClick={onClick}
          disabled={disabled}
          {...(href ? { href } : { type: 'button' })}
        >
          {icon && (
            <ListItemIcon className={iconClasses}>
              {badge !== undefined ? (
                <span className={styles.badgeWrapper}>
                  {icon}
                  <span className={badgeClasses}>{badge}</span>
                </span>
              ) : (
                icon
              )}
            </ListItemIcon>
          )}
          <ListItemText
            className={styles.text}
            primary={<span className={primaryTextClasses}>{label}</span>}
            secondary={secondaryLabel && <span className={styles.textSecondary}>{secondaryLabel}</span>}
          />
          {badge !== undefined && !icon && (
            <span className={styles.badgeWrapper}>
              <span className={`${badgeClasses} ${styles.badgeStatic}`}>{badge}</span>
            </span>
          )}
        </ButtonComponent>
      </ListItem>
    )
  }
)

NavItem.displayName = 'NavItem'

export { NavItem }
