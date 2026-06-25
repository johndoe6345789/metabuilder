import React from 'react'
import styles from '../../../scss/atoms/mat-badge.module.scss'

export type BadgeColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'info' | 'error' | 'surface'
export type BadgeSize = 'sm' | 'md' | 'lg'
export type BadgePosition = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' | 'inline'
export type BadgeVariant = 'standard' | 'outlined' | 'outline' | 'secondary' | 'filled' | 'tonal' | 'danger'
export type OverlapShape = 'circular' | 'rectangular'

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color' | 'content'> {
  children?: React.ReactNode
  content?: React.ReactNode
  /** Test ID for automated testing */
  testId?: string
  dot?: boolean
  invisible?: boolean
  max?: number
  color?: BadgeColor
  size?: BadgeSize
  position?: BadgePosition
  variant?: BadgeVariant
  overlap?: OverlapShape
  pulse?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  content,
  testId,
  dot = false,
  invisible = false,
  max,
  color = 'error',
  size = 'md',
  position = 'topRight',
  variant = 'standard',
  overlap,
  pulse = false,
  className = '',
  ...props
}) => {
  // Map size to Angular Material class names
  const sizeClass = {
    sm: 'mat-badge-small',
    md: 'mat-badge-medium',
    lg: 'mat-badge-large',
  }[size]

  // Map position to Angular Material class names
  const positionClasses = {
    topRight: 'mat-badge-above mat-badge-after',
    topLeft: 'mat-badge-above mat-badge-before',
    bottomRight: 'mat-badge-below mat-badge-after',
    bottomLeft: 'mat-badge-below mat-badge-before',
    inline: '',
  }[position]

  // Build container class list using Angular Material classes
  const containerClasses = [
    styles.matBadge,
    'mat-badge',
    sizeClass,
    positionClasses,
    overlap === 'circular' && 'mat-badge-overlap',
    invisible && 'mat-badge-hidden',
    // Color variant styles (local CSS module classes)
    color === 'primary' && styles.badgePrimary,
    color === 'secondary' && styles.badgeSecondary,
    color === 'tertiary' && styles.badgeTertiary,
    color === 'success' && styles.badgeSuccess,
    color === 'warning' && styles.badgeWarning,
    color === 'info' && styles.badgeInfo,
    color === 'surface' && styles.badgeSurface,
    // Note: 'error' is the default Angular Material color, no extra class needed
    variant === 'outlined' && styles.badgeOutlined,
    pulse && styles.badgePulse,
    position === 'inline' && styles.badgeInline,
    className,
  ].filter(Boolean).join(' ')

  // Build badge content class list
  const badgeContentClasses = [
    'mat-badge-content',
    'mat-badge-active',
    dot && 'mat-badge-small',
  ].filter(Boolean).join(' ')

  // Determine displayed content
  const displayContent = (() => {
    if (dot) return null
    if (max !== undefined && typeof content === 'number' && content > max) {
      return `${max}+`
    }
    return content
  })()

  return (
    <span className={containerClasses} data-testid={testId} {...props}>
      {children}
      <span className={badgeContentClasses}>
        {displayContent}
      </span>
    </span>
  )
}
