import React from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/statBadge.module.scss'

export type StatBadgeSize = 'sm' | 'md' | 'lg'
export type StatBadgeColor = 'primary' | 'secondary' | 'tertiary' | 'neutral'
export type StatBadgeStatus = 'pending' | 'success' | 'error' | 'warning' | 'info'

export interface StatBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  /** Size variant */
  size?: StatBadgeSize
  /** M3 color variant */
  color?: StatBadgeColor
  /** Status variant (legacy props also supported) */
  status?: StatBadgeStatus
  /** Use filled (stronger) variant */
  filled?: boolean
  /** Render as dot indicator (no text) */
  dot?: boolean
  /** Add pulsing animation */
  pulse?: boolean
  /** Content contains icon */
  withIcon?: boolean
  /** Show overflow indicator (+) */
  overflow?: boolean
  /** @deprecated Use status="pending" */
  pending?: boolean
  /** @deprecated Use status="success" */
  success?: boolean
  /** @deprecated Use status="error" */
  error?: boolean
  /** @deprecated Use status="info" */
  info?: boolean
  /** Test ID for automated testing */
  testId?: string
}

export const StatBadge: React.FC<StatBadgeProps> = ({
  children,
  size = 'md',
  color,
  status,
  filled = false,
  dot = false,
  pulse = false,
  withIcon = false,
  overflow = false,
  pending,
  success,
  error,
  info,
  testId,
  className,
  ...props
}) => {
  // Resolve status from legacy props if not explicitly set
  const resolvedStatus: StatBadgeStatus | undefined =
    status ?? (pending ? 'pending' : success ? 'success' : error ? 'error' : info ? 'info' : undefined)

  const badgeClasses = classNames(
    styles.statBadge,
    // Size variants
    {
      [styles.statBadgeSm]: size === 'sm',
      [styles.statBadgeLg]: size === 'lg',
    },
    // Status variants (filled or container)
    resolvedStatus && {
      [styles.statBadgeFilledSuccess]: filled && resolvedStatus === 'success',
      [styles.statBadgeFilledError]: filled && resolvedStatus === 'error',
      [styles.statBadgeFilledWarning]: filled && resolvedStatus === 'warning',
      [styles.statBadgeFilledInfo]: filled && resolvedStatus === 'info',
      [styles.statBadgeFilledPrimary]: filled && resolvedStatus === 'pending',
      [styles.statBadgePending]: !filled && resolvedStatus === 'pending',
      [styles.statBadgeSuccess]: !filled && resolvedStatus === 'success',
      [styles.statBadgeError]: !filled && resolvedStatus === 'error',
      [styles.statBadgeWarning]: !filled && resolvedStatus === 'warning',
      [styles.statBadgeInfo]: !filled && resolvedStatus === 'info',
    },
    // M3 color variants (only if no status)
    !resolvedStatus &&
      color && {
        [styles.statBadgePrimary]: !filled && color === 'primary',
        [styles.statBadgeSecondary]: !filled && color === 'secondary',
        [styles.statBadgeTertiary]: !filled && color === 'tertiary',
        [styles.statBadgeNeutral]: !filled && color === 'neutral',
        [styles.statBadgeFilledPrimary]: filled && color === 'primary',
      },
    // Feature modifiers
    {
      [styles.statBadgeDot]: dot,
      [styles.statBadgePulse]: pulse,
      [styles.statBadgeWithIcon]: withIcon,
      [styles.statBadgeOverflow]: overflow,
    },
    className
  )

  return (
    <span className={badgeClasses} data-testid={testId} {...props}>
      {children}
    </span>
  )
}
