'use client'

import { forwardRef } from 'react'

import { Button as FakemuiButton } from '@/fakemui'
import type { ButtonProps as FakemuiButtonProps } from '@/fakemui/fakemui/inputs/Button'

/** Button visual style variants */
export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'destructive' | 'ghost'

/** Button size options */
export type ButtonSize = 'small' | 'medium' | 'large' | 'icon'

/**
 * Props for the Button component
 * Wrapper around fakemui Button to maintain API compatibility
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'variant' | 'size'> {
  /** Visual style variant of the button */
  variant?: ButtonVariant
  /** Size of the button */
  size?: ButtonSize
  /** Whether to show a loading spinner */
  loading?: boolean
  /** Compatibility prop - ignored */
  asChild?: boolean
  /** Start icon element */
  startIcon?: React.ReactNode
  /** End icon element */
  endIcon?: React.ReactNode
  /** Full width button */
  fullWidth?: boolean
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'contained', size = 'medium', loading, disabled, children, sx, startIcon, endIcon, fullWidth, className, ...props }, ref) => {
    // Map MUI variants to fakemui variants
    const fakemuiVariant: FakemuiButtonProps['variant'] =
      variant === 'contained' ? 'primary' :
      variant === 'outlined' ? 'outline' :
      variant === 'text' ? 'text' :
      variant === 'destructive' ? 'danger' :
      variant === 'ghost' ? 'ghost' :
      'default'

    // Map MUI sizes to fakemui sizes
    const fakemuiSize: FakemuiButtonProps['size'] =
      size === 'small' ? 'sm' :
      size === 'large' ? 'lg' :
      'md'

    const isIcon = size === 'icon'

    // Combine className with any sx-based classes
    const combinedClassName = [className, sx?.className].filter(Boolean).join(' ')

    return (
      <FakemuiButton
        ref={ref}
        variant={fakemuiVariant}
        size={fakemuiSize}
        icon={isIcon}
        loading={loading}
        disabled={disabled}
        fullWidth={fullWidth}
        startIcon={startIcon}
        endIcon={endIcon}
        className={combinedClassName}
        {...props}
      >
        {children}
      </FakemuiButton>
    )
  }
)

Button.displayName = 'Button'

export { Button }
