import React, { forwardRef } from 'react'
import { useAccessible } from '../../../hooks/useAccessible'
import { sxToStyle } from '../utils/sx'
import styles from '../../../scss/atoms/icon-button.module.scss'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  /** Size variant (FakeMUI native) */
  sm?: boolean
  lg?: boolean
  /** Size variant (MUI-style) */
  size?: 'small' | 'medium' | 'large'
  /** Color variant */
  color?: 'default' | 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  /** Visual variant */
  variant?: 'standard' | 'filled' | 'filledPrimary' | 'outlined'
  /** Edge alignment for toolbar positioning */
  edge?: 'start' | 'end' | false
  /** MUI sx prop */
  sx?: Record<string, unknown>
  /** Unique identifier for testing and accessibility */
  testId?: string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, sm, lg, size, color, variant, edge, className = '', sx, style, testId, 'aria-label': ariaLabel, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'form',
      component: 'button',
      identifier: testId || ariaLabel,
    })
    // Build class list
    const classes = [
      styles.iconButton,
      // Size
      (size === 'small' || sm) && styles.iconButtonSm,
      (size === 'large' || lg) && styles.iconButtonLg,
      // Color
      color === 'primary' && styles.iconButtonPrimary,
      color === 'secondary' && styles.iconButtonSecondary,
      color === 'error' && styles.iconButtonError,
      color === 'success' && styles.iconButtonSuccess,
      color === 'inherit' && styles.iconButtonInherit,
      // Variant
      variant === 'filled' && styles.iconButtonFilled,
      variant === 'filledPrimary' && styles.iconButtonFilledPrimary,
      variant === 'outlined' && styles.iconButtonOutlined,
      // Edge
      edge === 'start' && styles.iconButtonEdgeStart,
      edge === 'end' && styles.iconButtonEdgeEnd,
      className,
    ].filter(Boolean).join(' ')

    return (
      <button
        ref={ref}
        className={classes}
        style={{ ...sxToStyle(sx), ...style }}
        data-testid={accessible['data-testid']}
        aria-label={ariaLabel || accessible['aria-label']}
        {...props}
      >
        {children}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'
