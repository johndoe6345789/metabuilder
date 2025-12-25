'use client'

import { forwardRef, ReactNode } from 'react'
import { Chip, ChipProps } from '@mui/material'

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export interface BadgeProps extends Omit<ChipProps, 'variant'> {
  variant?: BadgeVariant
  children?: ReactNode
}

const variantMap: Record<BadgeVariant, { variant: ChipProps['variant']; color?: ChipProps['color']; sx?: object }> = {
  default: { variant: 'filled', color: 'primary' },
  secondary: { variant: 'filled', color: 'secondary' },
  destructive: { variant: 'filled', color: 'error' },
  outline: { variant: 'outlined', color: 'default' },
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', children, sx, ...props }, ref) => {
    const config = variantMap[variant]

    return (
      <Chip
        ref={ref}
        label={children}
        variant={config.variant}
        color={config.color}
        size="small"
        sx={{
          height: 'auto',
          py: 0.25,
          px: 0.5,
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: '9999px',
          ...config.sx,
          ...sx,
        }}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
