import React from 'react'
import { sxToStyle } from '../utils/sx'
import styles from '../../../scss/atoms/avatar.module.scss'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  src?: string
  alt?: string
  /** Test ID for automated testing */
  testId?: string
  /** FakeMUI native sizes */
  sm?: boolean
  md?: boolean
  lg?: boolean
  xl?: boolean
  /** MUI-style variant */
  variant?: 'circular' | 'rounded' | 'square'
  /** MUI sx prop */
  sx?: Record<string, unknown>
}

export const Avatar: React.FC<AvatarProps> = ({
  children,
  src,
  alt = '',
  sm,
  md,
  lg,
  xl,
  variant = 'circular',
  testId,
  className = '',
  sx,
  style,
  ...props
}) => {
  const sizeClass = sm
    ? styles.avatarSm
    : md
      ? styles.avatarMd
      : lg
        ? styles.avatarLg
        : xl
          ? styles.avatarXl
          : ''

  const variantClass =
    variant === 'square'
      ? styles.avatarSquare
      : variant === 'rounded'
        ? styles.avatarRounded
        : ''

  return (
    <div
      className={`${styles.avatar} ${sizeClass} ${variantClass} ${className}`.trim()}
      style={{ ...sxToStyle(sx), ...style }}
      data-testid={testId}
      role="img"
      aria-label={alt || undefined}
      {...props}
    >
      {src ? <img src={src} alt={alt} /> : children}
    </div>
  )
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  max?: number
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ children, max, className = '', ...props }) => (
  <div className={`${styles.avatarGroup} ${className}`.trim()} {...props}>
    {children}
  </div>
)
