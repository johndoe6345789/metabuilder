'use client'

import { CSSProperties,forwardRef, ReactNode } from 'react'

import { Chip } from '@/fakemui/fakemui/data-display'

import styles from './Badge.module.scss'

/** Badge visual style variants */
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

/**
 * Props for the Badge component
 */
export interface BadgeProps {
  /** Visual style variant of the badge */
  variant?: BadgeVariant
  /** Content to display inside the badge */
  children?: ReactNode
  /** CSS class name for custom styling */
  className?: string
  /** Custom inline styles */
  style?: CSSProperties
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', children, className, style, ...props }, ref) => {
    const variantClass = {
      default: styles.default,
      secondary: styles.secondary,
      destructive: styles.destructive,
      outline: styles.outline,
    }[variant]

    return (
      <Chip
        sm
        outline={variant === 'outline'}
        error={variant === 'destructive'}
        className={`${styles.badge} ${variantClass} ${className || ''}`}
        style={style}
        {...props}
      >
        {children}
      </Chip>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
