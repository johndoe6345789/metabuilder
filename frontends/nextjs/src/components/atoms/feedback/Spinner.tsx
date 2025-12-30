'use client'

import { CircularProgress } from '@/fakemui'
import { forwardRef } from 'react'

/** Spinner size options */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

/**
 * Props for the Spinner component
 * Wrapper around fakemui CircularProgress to maintain API compatibility
 */
export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size of the spinner (xs: 16px, sm: 20px, md: 24px, lg: 40px) or a custom number */
  size?: SpinnerSize | number
  /** Whether to center the spinner in its container */
  centered?: boolean
  /** Color of the spinner */
  color?: string
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
}

const sizeMap: Record<SpinnerSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 40,
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', centered, color, sx, className, ...props }, ref) => {
    const dimension = typeof size === 'number' ? size : sizeMap[size]

    // Combine className with any sx-based classes
    const combinedClassName = [className, sx?.className].filter(Boolean).join(' ')

    const spinner = (
      <CircularProgress
        ref={ref}
        size={dimension}
        className={combinedClassName}
        {...props}
      />
    )

    if (centered) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          {spinner}
        </div>
      )
    }

    return spinner
  }
)

Spinner.displayName = 'Spinner'

export { Spinner }
