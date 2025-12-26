'use client'

import { forwardRef, ReactNode } from 'react'
import { Chip, ChipProps, SxProps, Theme } from '@mui/material'

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export interface BadgeProps {
  variant?: BadgeVariant
  children?: ReactNode
  className?: string
  sx?: SxProps<Theme>
}

const variantMap: Record<BadgeVariant, { variant: ChipProps['variant']; color?: ChipProps['color']; sx?: object }> = {
  default: { variant: 'filled', color: 'primary' },
  secondary: { variant: 'filled', color: 'secondary' },
  destructive: { variant: 'filled', color: 'error' },
  outline: { variant: 'outlined', color: 'default' },
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', children, className, sx, ...props }, ref) => {
    const config = variantMap[variant]

    return (
      <Chip
        ref={ref}
        label={children}
        variant={config.variant}
        color={config.color}
        size="small"
        className={className}
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
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
