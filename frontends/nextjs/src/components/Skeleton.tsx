'use client'

import React from 'react'

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

  return (
    <div
      className={`skeleton ${animate ? 'skeleton-animate' : ''} ${className ?? ''}`}
      style={{
        width: widthStyle,
        height: heightStyle,
        borderRadius: radiusStyle,
        backgroundColor: '#e0e0e0',
        ...style,
      }}
    />
  )
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
  return (
    <div className={`table-skeleton ${className ?? ''}`}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} style={{ padding: '12px', textAlign: 'left' }}>
                <Skeleton width="80%" height="20px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} style={{ borderBottom: '1px solid #f0f0f0' }}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} style={{ padding: '12px' }}>
                  <Skeleton width={colIdx === 0 ? '60%' : '90%'} height="20px" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
  return (
    <div className={`card-skeleton-grid ${className ?? ''}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: '16px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
          }}
        >
          <Skeleton width="40%" height="24px" style={{ marginBottom: '12px' }} />
          <Skeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
          <Skeleton width="85%" height="16px" style={{ marginBottom: '16px' }} />
          <Skeleton width="60%" height="36px" borderRadius="4px" />
        </div>
      ))}
    </div>
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
  return (
    <div className={`list-skeleton ${className ?? ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            borderBottom: '1px solid #f0f0f0',
            gap: '12px',
          }}
        >
          <Skeleton width="40px" height="40px" borderRadius="50%" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height="18px" style={{ marginBottom: '6px' }} />
            <Skeleton width="85%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  )
}
