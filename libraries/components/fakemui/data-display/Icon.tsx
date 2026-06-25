import React from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/mat-icon.module.scss'

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type IconColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'onSurface'
  | 'onSurfaceVariant'
  | 'inverse'
export type IconVariant = 'filled' | 'filledTonal' | 'outlined'

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  /** Icon size: xs (16px), sm (20px), md (24px), lg (32px), xl (40px), xxl (48px) */
  size?: IconSize
  /** Icon color using M3 color tokens */
  color?: IconColor
  /** Icon variant for background styling */
  variant?: IconVariant
  /** Whether the icon is disabled */
  disabled?: boolean
  /** Whether the icon should have button-like hover states */
  button?: boolean
  /** @deprecated Use size="sm" instead */
  sm?: boolean
  /** @deprecated Use size="lg" instead */
  lg?: boolean
  /** Test ID for automated testing */
  testId?: string
}

const sizeClassMap: Record<IconSize, string> = {
  xs: styles.iconXs,
  sm: styles.iconSm,
  md: styles.iconMd,
  lg: styles.iconLg,
  xl: styles.iconXl,
  xxl: styles.iconXxl,
}

const colorClassMap: Record<IconColor, string> = {
  primary: styles.iconPrimary,
  secondary: styles.iconSecondary,
  tertiary: styles.iconTertiary,
  error: styles.iconError,
  success: styles.iconSuccess,
  warning: styles.iconWarning,
  info: styles.iconInfo,
  onSurface: styles.iconOnSurface,
  onSurfaceVariant: styles.iconOnSurfaceVariant,
  inverse: styles.iconInverse,
}

const variantClassMap: Record<IconVariant, string> = {
  filled: styles.iconFilled,
  filledTonal: styles.iconFilledTonal,
  outlined: styles.iconOutlined,
}

export const Icon: React.FC<IconProps> = ({
  children,
  size,
  color,
  variant,
  disabled = false,
  button = false,
  sm,
  lg,
  testId,
  className,
  ...props
}) => {
  // Handle deprecated props for backwards compatibility
  const resolvedSize = size ?? (sm ? 'sm' : lg ? 'lg' : undefined)

  const iconClassName = classNames(
    styles.icon,
    resolvedSize && sizeClassMap[resolvedSize],
    color && colorClassMap[color],
    variant && variantClassMap[variant],
    {
      [styles.iconDisabled]: disabled,
      [styles.iconButton]: button,
    },
    className
  )

  return (
    <span className={iconClassName} data-testid={testId} aria-hidden="true" {...props}>
      {children}
    </span>
  )
}
