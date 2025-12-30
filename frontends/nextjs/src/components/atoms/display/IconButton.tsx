'use client'

import { IconButton as FakemuiIconButton } from '@/fakemui'
import { forwardRef } from 'react'

/** IconButton size options */
export type IconButtonSize = 'small' | 'medium' | 'large'

/**
 * Props for the IconButton component
 * Wrapper around fakemui IconButton to maintain API compatibility
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant of the icon button */
  variant?: 'default' | 'outlined' | 'contained'
  /** Size of the icon button */
  size?: IconButtonSize
  /** MUI color prop (ignored for compatibility) */
  color?: string
  /** MUI edge prop (ignored for compatibility) */
  edge?: string | false
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'default', size = 'medium', color, edge, sx, className, ...props }, ref) => {
    // Map size to fakemui size props
    const sizeProps = {
      sm: size === 'small',
      lg: size === 'large',
    }

    // Map variant to className
    const variantClass =
      variant === 'outlined' ? 'icon-btn--outlined' :
      variant === 'contained' ? 'icon-btn--contained' :
      ''

    // Combine className with any sx-based classes
    const combinedClassName = [className, sx?.className, variantClass].filter(Boolean).join(' ')

    return (
      <FakemuiIconButton
        ref={ref}
        className={combinedClassName}
        {...sizeProps}
        {...props}
      />
    )
  }
)

IconButton.displayName = 'IconButton'

export { IconButton }
