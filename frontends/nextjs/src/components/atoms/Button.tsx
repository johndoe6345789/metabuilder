'use client'

import { forwardRef } from 'react'
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material'

export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'destructive' | 'ghost'
export type ButtonSize = 'small' | 'medium' | 'large' | 'icon'

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  asChild?: boolean // Compatibility prop - ignored
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'contained', size = 'medium', loading, disabled, children, sx, ...props }, ref) => {
    const isIcon = size === 'icon'
    
    const muiVariant = variant === 'destructive' || variant === 'ghost' 
      ? (variant === 'ghost' ? 'text' : 'contained')
      : variant
    
    const muiColor = variant === 'destructive' ? 'error' : 'primary'

    return (
      <MuiButton
        ref={ref}
        variant={muiVariant}
        color={muiColor}
        size={isIcon ? 'medium' : size}
        disabled={disabled || loading}
        sx={{
          ...(isIcon && {
            minWidth: 40,
            width: 40,
            height: 40,
            p: 0,
            borderRadius: 1,
          }),
          ...(variant === 'ghost' && {
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }),
          ...sx,
        }}
        {...props}
      >
        {loading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          children
        )}
      </MuiButton>
    )
  }
)

Button.displayName = 'Button'

export { Button }
