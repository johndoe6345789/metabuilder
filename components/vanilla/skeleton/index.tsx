'use client'

import React, { createElement } from 'react'

/**
 * Skeleton Component for Loading States
 *
 * Creates animated placeholder content while data is loading.
 * Use for tables, cards, lists, and other async-loaded content.
 */

export interface SkeletonProps {
  /**
   * Width of the skeleton (can be percentage or fixed value)
   * @default '100%'
   */
  width?: string | number

  /**
   * Height of the skeleton (can be percentage or fixed value)
   * @default '20px'
   */
  height?: string | number

  /**
   * Border radius for rounded corners
   * @default '4px'
   */
  borderRadius?: string | number

  /**
   * Whether to show animation
   * @default true
   */
  animate?: boolean

  /**
   * CSS class name for custom styling
   */
  className?: string

  /**
   * Custom style overrides
   */
  style?: React.CSSProperties
}

/**
 * Single skeleton line/block
 */
export function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  animate = true,
  className,
  style,
}: SkeletonProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width
  const heightStyle = typeof height === 'number' ? `${height}px` : height
  const radiusStyle = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius

  return createElement('div', {
    className: `skeleton ${animate ? 'skeleton-animate' : ''} ${className ?? ''}`,
    style: {
      width: widthStyle,
      height: heightStyle,
      borderRadius: radiusStyle,
      backgroundColor: '#e0e0e0',
      animation: animate ? 'skeleton-pulse 1.5s ease-in-out infinite' : undefined,
      ...style,
    }
  })
}

/**
 * Table skeleton with rows and columns
 */
export interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return createElement('div', { className: `table-skeleton ${className ?? ''}` },
    createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
      createElement('thead', null,
        createElement('tr', { style: { borderBottom: '1px solid #e0e0e0' } },
          Array.from({ length: columns }).map((_, i) =>
            createElement('th', { key: i, style: { padding: '12px', textAlign: 'left' } },
              createElement(Skeleton, { width: '80%', height: '20px' })
            )
          )
        )
      ),
      createElement('tbody', null,
        Array.from({ length: rows }).map((_, rowIdx) =>
          createElement('tr', { key: rowIdx, style: { borderBottom: '1px solid #f0f0f0' } },
            Array.from({ length: columns }).map((_, colIdx) =>
              createElement('td', { key: colIdx, style: { padding: '12px' } },
                createElement(Skeleton, { width: colIdx === 0 ? '60%' : '90%', height: '20px' })
              )
            )
          )
        )
      )
    )
  )
}

/**
 * Card skeleton layout
 */
export interface CardSkeletonProps {
  count?: number
  className?: string
}

export function CardSkeleton({ count = 3, className }: CardSkeletonProps) {
  return createElement('div', {
    className: `card-skeleton-grid ${className ?? ''}`,
    style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }
  },
    Array.from({ length: count }).map((_, i) =>
      createElement('div', {
        key: i,
        style: {
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
        }
      },
        createElement(Skeleton, { width: '40%', height: '24px', style: { marginBottom: '12px' } }),
        createElement(Skeleton, { width: '100%', height: '16px', style: { marginBottom: '8px' } }),
        createElement(Skeleton, { width: '85%', height: '16px', style: { marginBottom: '16px' } }),
        createElement(Skeleton, { width: '60%', height: '36px', borderRadius: '4px' })
      )
    )
  )
}

/**
 * List item skeleton
 */
export interface ListSkeletonProps {
  count?: number
  className?: string
}

export function ListSkeleton({ count = 8, className }: ListSkeletonProps) {
  return createElement('div', { className: `list-skeleton ${className ?? ''}` },
    Array.from({ length: count }).map((_, i) =>
      createElement('div', {
        key: i,
        style: {
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          borderBottom: '1px solid #f0f0f0',
          gap: '12px',
        }
      },
        createElement(Skeleton, { width: '40px', height: '40px', borderRadius: '50%', style: { flexShrink: 0 } }),
        createElement('div', { style: { flex: 1 } },
          createElement(Skeleton, { width: '60%', height: '18px', style: { marginBottom: '6px' } }),
          createElement(Skeleton, { width: '85%', height: '14px' })
        )
      )
    )
  )
}

/**
 * Form skeleton for loading form states
 */
export interface FormSkeletonProps {
  fields?: number
  className?: string
}

export function FormSkeleton({ fields = 4, className }: FormSkeletonProps) {
  return createElement('div', { className: `form-skeleton ${className ?? ''}` },
    Array.from({ length: fields }).map((_, i) =>
      createElement('div', { key: i, style: { marginBottom: '20px' } },
        createElement(Skeleton, { width: '30%', height: '14px', style: { marginBottom: '8px' } }),
        createElement(Skeleton, { width: '100%', height: '40px', borderRadius: '4px' })
      )
    ),
    createElement('div', { style: { display: 'flex', gap: '12px', marginTop: '24px' } },
      createElement(Skeleton, { width: '100px', height: '40px', borderRadius: '4px' }),
      createElement(Skeleton, { width: '80px', height: '40px', borderRadius: '4px' })
    )
  )
}

/**
 * Avatar skeleton
 */
export interface AvatarSkeletonProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function AvatarSkeleton({ size = 'medium', className }: AvatarSkeletonProps) {
  const sizeMap = {
    small: '32px',
    medium: '48px',
    large: '80px',
  }

  return createElement(Skeleton, {
    width: sizeMap[size],
    height: sizeMap[size],
    borderRadius: '50%',
    className,
  })
}

/**
 * Text skeleton with multiple lines
 */
export interface TextSkeletonProps {
  lines?: number
  lastLineWidth?: string
  className?: string
}

export function TextSkeleton({ lines = 3, lastLineWidth = '60%', className }: TextSkeletonProps) {
  return createElement('div', { className: `text-skeleton ${className ?? ''}` },
    Array.from({ length: lines }).map((_, i) =>
      createElement(Skeleton, {
        key: i,
        width: i === lines - 1 ? lastLineWidth : '100%',
        height: '16px',
        style: { marginBottom: i < lines - 1 ? '8px' : undefined },
      })
    )
  )
}

/**
 * CSS keyframes for skeleton animations - inject these styles in your app
 *
 * @example
 * // Add to your global CSS:
 * @keyframes skeleton-pulse {
 *   0% { opacity: 1; }
 *   50% { opacity: 0.5; }
 *   100% { opacity: 1; }
 * }
 */
export const skeletonStyles = `
@keyframes skeleton-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
.skeleton-animate {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .skeleton-animate {
    animation: none;
  }
}
`
