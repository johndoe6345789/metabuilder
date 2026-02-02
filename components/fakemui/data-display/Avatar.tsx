import React from 'react'
import { sxToStyle } from '../utils/sx'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  src?: string
  alt?: string
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
  className = '',
  sx,
  style,
  ...props
}) => (
  <div
    className={`avatar flex-center avatar--${variant} ${sm ? 'avatar--sm' : ''} ${md ? 'avatar--md' : ''} ${lg ? 'avatar--lg' : ''} ${xl ? 'avatar--xl' : ''} ${className}`}
    style={{ ...sxToStyle(sx), ...style }}
    {...props}
  >
    {src ? <img src={src} alt={alt} /> : children}
  </div>
)

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  max?: number
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ children, max, className = '', ...props }) => (
  <div className={`avatar-group ${className}`} {...props}>
    {children}
  </div>
)
