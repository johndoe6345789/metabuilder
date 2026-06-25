import React from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/label.module.scss'

// Size variants
export type LabelSize = 'sm' | 'md' | 'lg'

// Color variants
export type LabelColor =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'onSurface'

export interface LabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  /** Size variant: sm (small), md (medium/default), lg (large) */
  size?: LabelSize
  /** Color variant */
  color?: LabelColor
  /** Transform text to uppercase */
  uppercase?: boolean
  /** Show required asterisk indicator */
  required?: boolean
  /** Enable inline-flex layout for icon alignment */
  withIcon?: boolean
  /** Associate label with form element */
  htmlFor?: string
  /** Test ID for automated testing */
  testId?: string
}

const sizeClassMap: Record<LabelSize, string | undefined> = {
  sm: styles.labelSm,
  md: undefined, // default, no extra class needed
  lg: styles.labelLg,
}

const colorClassMap: Record<LabelColor, string> = {
  primary: styles.labelPrimary,
  secondary: styles.labelSecondary,
  error: styles.labelError,
  success: styles.labelSuccess,
  warning: styles.labelWarning,
  info: styles.labelInfo,
  onSurface: styles.labelOnSurface,
}

export const Label: React.FC<LabelProps> = ({
  children,
  className,
  size = 'md',
  color,
  uppercase = false,
  required = false,
  withIcon = false,
  testId,
  ...props
}) => {
  const labelClassName = classNames(
    styles.label,
    sizeClassMap[size],
    color && colorClassMap[color],
    {
      [styles.labelUppercase]: uppercase,
      [styles.labelRequired]: required,
      [styles.labelWithIcon]: withIcon,
    },
    className
  )

  return (
    <span className={labelClassName} data-testid={testId} {...props}>
      {children}
    </span>
  )
}

// ============================================================================
// FieldLabel - Form field label component
// ============================================================================

export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode
  /** Show error styling */
  error?: boolean
  /** Show focused styling */
  focused?: boolean
  /** Show required asterisk indicator */
  required?: boolean
}

export const FieldLabel: React.FC<FieldLabelProps> = ({
  children,
  className,
  error = false,
  focused = false,
  required = false,
  ...props
}) => {
  const labelClassName = classNames(
    styles.fieldLabel,
    {
      [styles.fieldLabelError]: error,
      [styles.fieldLabelFocused]: focused && !error,
      [styles.labelRequired]: required,
    },
    className
  )

  return (
    <label className={labelClassName} {...props}>
      {children}
    </label>
  )
}

// ============================================================================
// HelperText - Helper text below form fields
// ============================================================================

export interface HelperTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  /** Show error styling */
  error?: boolean
}

export const HelperText: React.FC<HelperTextProps> = ({
  children,
  className,
  error = false,
  ...props
}) => {
  const helperClassName = classNames(
    styles.helperText,
    {
      [styles.helperTextError]: error,
    },
    className
  )

  return (
    <span className={helperClassName} {...props}>
      {children}
    </span>
  )
}

// ============================================================================
// CounterText - Character counter text
// ============================================================================

export interface CounterTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  /** Current character count */
  count?: number
  /** Maximum character limit */
  maxLength?: number
  /** Show error styling (typically when count > maxLength) */
  error?: boolean
}

export const CounterText: React.FC<CounterTextProps> = ({
  children,
  className,
  count,
  maxLength,
  error = false,
  ...props
}) => {
  const counterClassName = classNames(
    styles.counterText,
    {
      [styles.counterTextError]: error || (count !== undefined && maxLength !== undefined && count > maxLength),
    },
    className
  )

  // If count and maxLength provided, render formatted counter
  const content = count !== undefined && maxLength !== undefined
    ? `${count}/${maxLength}`
    : children

  return (
    <span className={counterClassName} {...props}>
      {content}
    </span>
  )
}
