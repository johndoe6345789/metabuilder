'use client'

import { Divider, DividerProps } from '@mui/material'
import { forwardRef } from 'react'

/**
 * Props for the Separator component
 * @extends {DividerProps} Inherits Material-UI Divider props
 */
export interface SeparatorProps extends DividerProps {
  /** Whether the separator is decorative (for accessibility) */
  decorative?: boolean
}

const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  ({ orientation = 'horizontal', decorative, ...props }, ref) => {
    return (
      <Divider
        ref={ref}
        orientation={orientation}
        role={decorative ? 'presentation' : 'separator'}
        {...props}
      />
    )
  }
)

Separator.displayName = 'Separator'

export { Separator }
