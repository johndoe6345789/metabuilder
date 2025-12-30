'use client'

import { Chip } from '@/fakemui'
import { forwardRef } from 'react'

/** Badge visual style variants */
export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'

/**
 * Props for the Badge component
 * Uses fakemui Chip component for badge functionality
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style variant of the badge */
  variant?: BadgeVariant
  /** Label text */
  label?: string | React.ReactNode
  /** Size of the badge */
  size?: 'small' | 'medium'
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
  /** Whether badge is clickable */
  clickable?: boolean
  /** Delete handler */
  onDelete?: () => void
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', size = 'small', label, children, sx, className, ...props }, ref) => {
    // Map variant to color class
    const variantClass =
      variant === 'destructive' ? 'chip--error' :
      variant === 'success' ? 'chip--success' :
      variant === 'warning' ? 'chip--warning' :
      variant === 'secondary' ? 'chip--secondary' :
      variant === 'outline' ? 'chip--outline' :
      ''

    // Combine className with any sx-based classes
    const combinedClassName = [className, sx?.className, variantClass].filter(Boolean).join(' ')

    return (
      <Chip
        ref={ref}
        label={label || children}
        size={size}
        className={combinedClassName}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
