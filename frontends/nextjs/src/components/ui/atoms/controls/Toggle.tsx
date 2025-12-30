'use client'

import { ToggleButton, ToggleButtonProps } from '@/fakemui/fakemui/inputs'
import { forwardRef, CSSProperties } from 'react'
import styles from './Toggle.module.scss'

/** Toggle button visual style variants */
export type ToggleVariant = 'default' | 'outline'

/** Toggle button size options */
export type ToggleSize = 'default' | 'sm' | 'lg'

/**
 * Props for the Toggle component
 * @extends {ToggleButtonProps} Inherits fakemui ToggleButton props
 */
export interface ToggleProps extends Omit<ToggleButtonProps, 'size'> {
  /** Visual style variant of the toggle button */
  variant?: ToggleVariant
  /** Size of the toggle button */
  size?: ToggleSize
  /** Controlled pressed state */
  pressed?: boolean
  /** Callback when pressed state changes */
  onPressedChange?: (pressed: boolean) => void
  /** Custom inline styles */
  style?: CSSProperties
}

const sizeMap: Record<ToggleSize, 'small' | 'medium' | 'large'> = {
  sm: 'small',
  default: 'medium',
  lg: 'large',
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    { variant = 'default', size = 'default', pressed, onPressedChange, className, style, value, ...props },
    ref
  ) => {
    const sizeClass = styles[size] || styles.default

    return (
      <ToggleButton
        ref={ref}
        value={value || 'toggle'}
        selected={pressed}
        onClick={() => onPressedChange?.(!pressed)}
        size={sizeMap[size]}
        className={`${styles.toggle} ${sizeClass} ${variant === 'outline' ? styles.outline : ''} ${pressed ? styles.pressed : ''} ${className || ''}`}
        style={style}
        {...props}
      />
    )
  }
)

Toggle.displayName = 'Toggle'

export { Toggle }
