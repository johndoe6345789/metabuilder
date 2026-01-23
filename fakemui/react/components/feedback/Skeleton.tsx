import React from 'react'
import { classNames } from '../utils/classNames'

export type SkeletonVariant = 'text' | 'rectangular' | 'circular' | 'rounded'
export type SkeletonAnimation = 'pulse' | 'wave' | false

export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The type of skeleton shape */
  variant?: SkeletonVariant
  /** Width of the skeleton (accepts CSS units) */
  width?: string | number
  /** Height of the skeleton (accepts CSS units) */
  height?: string | number
  /** Animation type or false to disable */
  animation?: SkeletonAnimation
  /** If true, skeleton takes up full width of parent */
  fullWidth?: boolean
  /** Custom component to render as skeleton root */
  component?: React.ElementType
}

/**
 * Loading placeholder with shimmer animation
 * 
 * @example
 * ```tsx
 * // Basic text skeleton
 * <Skeleton variant="text" width={210} />
 * 
 * // Avatar placeholder
 * <Skeleton variant="circular" width={40} height={40} />
 * 
 * // Card image placeholder
 * <Skeleton variant="rectangular" height={118} />
 * ```
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  fullWidth = false,
  component: Component = 'span',
  className,
  style,
  ...props
}) => {
  const rootClassName = classNames(
    'fakemui-skeleton',
    `fakemui-skeleton--${variant}`,
    animation && `fakemui-skeleton--${animation}`,
    fullWidth && 'fakemui-skeleton--full-width',
    className
  )

  const rootStyle: React.CSSProperties = {
    ...style,
    width: fullWidth ? '100%' : width,
    height,
  }

  return <Component className={rootClassName} style={rootStyle} {...props} />
}

export default Skeleton

