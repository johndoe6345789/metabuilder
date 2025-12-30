'use client'

import { forwardRef } from 'react'

import { Divider } from '@/fakemui'

/**
 * Props for the Separator component
 * Wrapper around fakemui Divider to maintain API compatibility
 */
export interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  /** Orientation of the separator */
  orientation?: 'horizontal' | 'vertical'
  /** Whether the separator is decorative (for accessibility) */
  decorative?: boolean
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
}

const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  ({ orientation = 'horizontal', decorative, sx, className, ...props }, ref) => {
    // Combine className with any sx-based classes
    const combinedClassName = [className, sx?.className].filter(Boolean).join(' ')

    return (
      <Divider
        ref={ref}
        orientation={orientation}
        role={decorative ? 'presentation' : 'separator'}
        className={combinedClassName}
        {...props}
      />
    )
  }
)

Separator.displayName = 'Separator'

export { Separator }
