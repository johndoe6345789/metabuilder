import React, { forwardRef } from 'react'
import { useAccessible } from '../../../src/utils/useAccessible'

/**
 * Valid button variants for styling
 */
export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'text'

/**
 * Valid button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  /** Button style variant */
  variant?: ButtonVariant
  /** Button size */
  size?: ButtonSize
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
}

/**
 * Get variant class from props (supports legacy and new API)
 */
const getVariantClass = (props: ButtonProps): string => {
  if (props.variant) return `btn--${props.variant}`
  if (props.primary) return 'btn--primary'
  if (props.secondary) return 'btn--secondary'
  if (props.outline) return 'btn--outline'
  if (props.ghost) return 'btn--ghost'
  return ''
}

/**
 * Get size class from props (supports legacy and new API)
 */
const getSizeClass = (props: ButtonProps): string => {
  if (props.size) return `btn--${props.size}`
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
      className,
    ].filter(Boolean).join(' ')

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        data-testid={accessible['data-testid']}
        aria-label={ariaLabel || accessible['aria-label']}
        aria-busy={ariaBusy ?? loading}
        aria-disabled={disabled || loading}
        {...restProps}
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
      </button>
    )
  }
)

Button.displayName = 'Button'
