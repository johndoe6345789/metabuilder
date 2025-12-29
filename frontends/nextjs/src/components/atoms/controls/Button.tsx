'use client'

import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material'
import { forwardRef } from 'react'

/** Button visual style variants */
export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'destructive' | 'ghost'

/** Button size options */
export type ButtonSize = 'small' | 'medium' | 'large' | 'icon'

/**
 * Props for the Button component
 * @extends {MuiButtonProps} Inherits Material-UI Button props
 */
export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  /** Visual style variant of the button */
  variant?: ButtonVariant
  /** Size of the button */
  size?: ButtonSize
  /** Whether to show a loading spinner */
  loading?: boolean
  /** Compatibility prop - ignored */
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'contained', size = 'medium', loading, disabled, children, sx, ...props }, ref) => {
    const isIcon = size === 'icon'

    const muiVariant =
      variant === 'destructive' || variant === 'ghost'
        ? variant === 'ghost'
          ? 'text'
          : 'contained'
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
        {loading ? <CircularProgress size={20} color="inherit" /> : children}
      </MuiButton>
    )
  }
)

Button.displayName = 'Button'

export { Button }
