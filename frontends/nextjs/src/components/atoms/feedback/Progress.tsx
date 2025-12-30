'use client'

import { LinearProgress, CircularProgress } from '@/fakemui'
import { forwardRef } from 'react'

/**
 * Props for the Progress component
 * Wrapper around fakemui LinearProgress to maintain API compatibility
 */
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value?: number
  /** Whether to display a percentage label next to the progress bar */
  showLabel?: boolean
  /** Variant of the progress bar */
  variant?: 'determinate' | 'indeterminate'
  /** Color of the progress bar */
  color?: string
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, showLabel, variant, color, sx, className, ...props }, ref) => {
    // Combine className with any sx-based classes
    const combinedClassName = [className, sx?.className].filter(Boolean).join(' ')

    if (showLabel && value !== undefined) {
      return (
        <div ref={ref} className={`progress-with-label ${combinedClassName}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <LinearProgress
              value={value}
              className={combinedClassName}
              {...props}
            />
          </div>
          <span className="progress-label text-secondary" style={{ minWidth: '40px' }}>
            {Math.round(value)}%
          </span>
        </div>
      )
    }

    return (
      <LinearProgress
        ref={ref}
        value={value}
        className={combinedClassName}
        {...props}
      />
    )
  }
)

Progress.displayName = 'Progress'

// Also export CircularProgress for convenience
export { CircularProgress, Progress }
