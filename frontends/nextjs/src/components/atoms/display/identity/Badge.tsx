'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { Chip, ChipProps } from '@mui/material'

/** Badge visual style variants */
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'

/**
 * Props for the Badge component
 * @extends {ChipProps} Inherits Material-UI Chip props
 */
export interface BadgeProps extends Omit<ChipProps, 'variant'> {
  /** Visual style variant of the badge */
  variant?: BadgeVariant
}

const variantMap: Record<BadgeVariant, { color: ChipProps['color']; variant: ChipProps['variant'] }> = {
  default: { color: 'primary', variant: 'filled' },
  secondary: { color: 'secondary', variant: 'filled' },
  destructive: { color: 'error', variant: 'filled' },
  outline: { color: 'default', variant: 'outlined' },
  success: { color: 'success', variant: 'filled' },
  warning: { color: 'warning', variant: 'filled' },
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', size = 'small', ...props }, ref) => {
    const config = variantMap[variant]
    
    return (
      <Chip
        ref={ref}
        color={config.color}
        variant={config.variant}
        size={size}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
