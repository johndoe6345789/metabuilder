import React, { forwardRef } from 'react'
import { useAccessible } from '../../../hooks/useAccessible'

/**
 * Valid button variants for styling
 * Supports both FakeMUI native variants and MUI-style aliases
 */
export type ButtonVariant =
  | 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'text'
  // MUI-style aliases
  | 'contained' | 'outlined'

/**
 * Valid button sizes
 * Supports both FakeMUI native sizes and MUI-style aliases
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  /** Button style variant */
  variant?: ButtonVariant
  /** Button size */
  size?: ButtonSize
  /** MUI-style color prop (maps to variant) */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'inherit'
  /** @deprecated Use variant="primary" instead */
  primary?: boolean
  /** @deprecated Use variant="secondary" instead */
  secondary?: boolean
  /** @deprecated Use variant="outline" instead */
  outline?: boolean
  /** @deprecated Use variant="ghost" instead */
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
 * Map MUI-style variants to FakeMUI variants
 */
const normalizeVariant = (variant?: ButtonVariant, color?: string): string => {
  // MUI variant aliases
  if (variant === 'contained') return color === 'secondary' ? 'secondary' : 'primary'
  if (variant === 'outlined') return 'outline'
  return variant || ''
}

/**
 * Map MUI-style sizes to FakeMUI sizes
 */
const normalizeSize = (size?: ButtonSize): string => {
  if (size === 'small') return 'sm'
  if (size === 'medium') return 'md'
  if (size === 'large') return 'lg'
  return size || ''
}

/**
 * Get variant class from props (supports legacy, new API, and MUI-style)
 */
const getVariantClass = (props: ButtonProps): string => {
  const normalized = normalizeVariant(props.variant, props.color)
  if (normalized) return `btn--${normalized}`
  if (props.primary) return 'btn--primary'
  if (props.secondary) return 'btn--secondary'
  if (props.outline) return 'btn--outline'
  if (props.ghost) return 'btn--ghost'
  return ''
}

/**
 * Get size class from props (supports legacy, new API, and MUI-style)
 */
const getSizeClass = (props: ButtonProps): string => {
  const normalized = normalizeSize(props.size)
  if (normalized) return `btn--${normalized}`
  if (props.sm) return 'btn--sm'
  if (props.lg) return 'btn--lg'
  return ''
}

/**
 * Button component with Material-UI inspired styling
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="outline" startIcon={<Plus />}>Add Item</Button>
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

    const classes = [
      'btn',
      getVariantClass(props),
      getSizeClass(props),
      icon ? 'btn--icon' : '',
      loading ? 'btn--loading' : '',
      fullWidth ? 'btn--full-width' : '',
      edge === 'start' ? 'btn--edge-start' : '',
      edge === 'end' ? 'btn--edge-end' : '',
      color && color !== 'inherit' ? `btn--color-${color}` : '',
      className,
    ].filter(Boolean).join(' ')

    // Support rendering as different element (for Next.js Link, etc.)
    const Element = Component || 'button'
    const elementProps = Component ? { ...restProps, href } : { ...restProps, type }

    return (
      <Element
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        data-testid={accessible['data-testid']}
        aria-label={ariaLabel || accessible['aria-label']}
        aria-busy={ariaBusy ?? loading}
        aria-disabled={disabled || loading}
        {...elementProps}
      >
        {loading && (
          <span className="btn__spinner" aria-hidden="true">
            <svg className="btn__spinner-icon" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        )}
        {startIcon && <span className="btn__start-icon" aria-hidden="true">{startIcon}</span>}
        {children && <span className="btn__content">{children}</span>}
        {endIcon && <span className="btn__end-icon" aria-hidden="true">{endIcon}</span>}
      </Element>
    )
  }
)

Button.displayName = 'Button'
