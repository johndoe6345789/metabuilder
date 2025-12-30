import React from 'react'

export type SkeletonVariant = 'text' | 'rectangular' | 'circular'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({ variant = 'text', width, height, className = '', ...props }) => (
  <div className={`skeleton skeleton--${variant} ${className}`} style={{ width, height }} {...props} />
)
