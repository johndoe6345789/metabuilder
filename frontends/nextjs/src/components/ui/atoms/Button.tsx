'use client'

import { forwardRef } from 'react'
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material'

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const variantMap: Record<ButtonVariant, { variant: MuiButtonProps['variant']; color?: MuiButtonProps['color']; sx?: object }> = {
  default: { variant: 'contained', color: 'primary' },
  destructive: { variant: 'contained', color: 'error' },
  outline: { variant: 'outlined', color: 'inherit' },
  secondary: { variant: 'contained', color: 'secondary' },
  ghost: { variant: 'text', color: 'inherit' },
  link: { variant: 'text', color: 'primary', sx: { textDecoration: 'underline', '&:hover': { textDecoration: 'underline' } } },
}

const sizeMap: Record<ButtonSize, MuiButtonProps['size'] | { size: MuiButtonProps['size']; sx?: object }> = {
  default: 'medium',
  sm: 'small',
  lg: 'large',
  icon: { size: 'medium', sx: { minWidth: 40, width: 40, height: 40, p: 0 } },
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', children, sx, ...props }, ref) => {
    const variantConfig = variantMap[variant]
    const sizeConfig = sizeMap[size]
    const muiSize = typeof sizeConfig === 'string' ? sizeConfig : sizeConfig.size
    const sizeSx = typeof sizeConfig === 'object' ? sizeConfig.sx : {}

    return (
      <MuiButton
        ref={ref}
        variant={variantConfig.variant}
        color={variantConfig.color}
        size={muiSize}
        sx={{ ...variantConfig.sx, ...sizeSx, ...sx }}
        {...props}
      >
        {children}
      </MuiButton>
    )
  }
)

Button.displayName = 'Button'

export { Button }
