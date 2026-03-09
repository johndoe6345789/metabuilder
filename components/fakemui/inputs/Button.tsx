import React, { forwardRef } from 'react'
import { useAccessible } from '../../../hooks/useAccessible'

// Import official Angular Material button SCSS module
import styles from '../../../scss/atoms/mat-button.module.scss'

/**
 * Valid button variants - maps to Angular Material button types
 */
export type ButtonVariant =
  | 'text' | 'outlined' | 'filled' | 'tonal' | 'elevated'
  // Aliases for compatibility
  | 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  | 'contained'

/**
 * Valid button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  /** Button style variant */
  variant?: ButtonVariant
  /** Button size */
  size?: ButtonSize
  /** MUI-style color prop */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'inherit'
  /** @deprecated Use variant="filled" instead */
  primary?: boolean
  /** @deprecated Use variant="tonal" instead */
  secondary?: boolean
  /** @deprecated Use variant="outlined" instead */
  outline?: boolean
  /** @deprecated Use variant="text" instead */
  ghost?: boolean
  /** @deprecated Use size="sm" instead */
  sm?: boolean
  /** @deprecated Use size="lg" instead */
  lg?: boolean
  /** Icon-only button styling */
  icon?: boolean
  /** Show loading spinner and disable */
  loading?: boolean
  /** Full width button */
  fullWidth?: boolean
  /** Start icon element */
  startIcon?: React.ReactNode
  /** End icon element */
  endIcon?: React.ReactNode
  /** Unique identifier for testing and accessibility */
  testId?: string
  /** MUI-style sx prop for inline styles */
  sx?: Record<string, unknown>
  /** Render as different element (for Link, etc.) */
  component?: React.ElementType
  /** URL for link buttons */
  href?: string
  /** Edge alignment for icon buttons in toolbars */
  edge?: 'start' | 'end' | false
}

/**
 * Map variant props to Angular Material button class key.
 * Returns the CSS Module key from the styles object.
 */
const getButtonClass = (props: ButtonProps): string => {
  const { variant, primary, secondary, outline, ghost } = props

  // Legacy boolean props
  if (primary) return 'mat-mdc-unelevated-button'
  if (secondary) return 'mat-tonal-button'
  if (outline) return 'mat-mdc-outlined-button'
  if (ghost) return 'mat-mdc-button'

  // Modern variant prop
  switch (variant) {
    case 'filled':
    case 'primary':
    case 'contained':
      return 'mat-mdc-unelevated-button'
    case 'elevated':
      return 'mat-mdc-raised-button'
    case 'tonal':
    case 'secondary':
      return 'mat-tonal-button'
    case 'outlined':
    case 'outline':
      return 'mat-mdc-outlined-button'
    case 'text':
    case 'default':
    case 'ghost':
      return 'mat-mdc-button'
    case 'danger':
      return 'mat-mdc-unelevated-button'
    default:
      return 'mat-mdc-button'
  }
}

/**
 * Get color class key for Angular Material
 */
const getColorClass = (props: ButtonProps): string => {
  const { variant, color } = props

  if (variant === 'danger' || color === 'error') return 'mat-warn'
  if (color === 'secondary') return 'mat-accent'
  return 'mat-primary'
}

/**
 * Resolve a class name through the CSS Module styles object.
 * Falls back to raw string if not found (for child elements).
 */
const s = (key: string): string => styles[key] || key

/**
 * Button component using official Angular Material M3 styles
 *
 * @example
 * ```tsx
 * <Button variant="filled">Click me</Button>
 * <Button variant="outlined" startIcon={<Plus />}>Add Item</Button>
 * <Button variant="tonal">Secondary Action</Button>
 * <Button loading>Saving...</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      children,
      variant,
      size,
      color,
      primary,
      secondary,
      outline,
      ghost,
      sm,
      lg,
      icon,
      loading,
      fullWidth,
      startIcon,
      endIcon,
      disabled,
      className = '',
      type = 'button',
      testId: customTestId,
      sx,
      component: Component,
      href,
      edge,
      'aria-busy': ariaBusy,
      'aria-label': ariaLabel,
      ...restProps
    } = props

    const accessible = useAccessible({
      feature: 'form',
      component: 'button',
      identifier: customTestId || String(children)?.substring(0, 20),
    })

    const isDisabled = disabled || loading

    const classes = [
      s('mdc-button'),
      s('mat-mdc-button-base'),
      s(getButtonClass(props)),
      s(getColorClass(props)),
      isDisabled ? s('mat-mdc-button-disabled') : '',
      fullWidth ? styles.fullWidth : '',
      className,
    ].filter(Boolean).join(' ')

    // Support rendering as different element (for Next.js Link, etc.)
    const Element = Component || 'button'
    const elementProps = Component ? { ...restProps, href } : { ...restProps, type }

    // Size styling via CSS custom properties
    const sizeStyle: React.CSSProperties = {}
    const normalizedSize = size === 'small' ? 'sm' : size === 'large' ? 'lg' : size
    if (normalizedSize === 'sm' || sm) {
      sizeStyle['--mat-button-text-container-height' as string] = '32px'
    } else if (normalizedSize === 'lg' || lg) {
      sizeStyle['--mat-button-text-container-height' as string] = '48px'
    }

    return (
      <Element
        ref={ref}
        className={classes}
        disabled={isDisabled}
        data-testid={accessible['data-testid']}
        aria-label={ariaLabel || accessible['aria-label']}
        aria-busy={ariaBusy ?? loading}
        aria-disabled={isDisabled}
        style={sizeStyle}
        {...elementProps}
      >
        {/* Touch target for accessibility (48px minimum) */}
        <span className={s('mat-mdc-button-touch-target')} />

        {/* Ripple container */}
        <span className={s('mat-mdc-button-ripple')} />

        {/* Persistent ripple for hover/focus/active states */}
        <span className={s('mat-mdc-button-persistent-ripple')} />

        {/* Focus indicator */}
        <span className={s('mat-focus-indicator')} />

        {/* Loading spinner */}
        {loading && (
          <span className={`${s('mat-icon')} ${styles.spinner}`} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '1.125rem', height: '1.125rem', animation: 'mat-button-spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        )}

        {/* Start icon */}
        {startIcon && <span className={s('mat-icon')} aria-hidden="true">{startIcon}</span>}

        {/* Label */}
        <span className={s('mdc-button__label')}>{children}</span>

        {/* End icon */}
        {endIcon && <span className={s('mat-icon')} aria-hidden="true">{endIcon}</span>}
      </Element>
    )
  }
)

Button.displayName = 'Button'
