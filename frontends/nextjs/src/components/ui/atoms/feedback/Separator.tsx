'use client'

import { forwardRef } from 'react'
import { Divider, DividerProps } from '@mui/material'

/**
 * Props for the Separator component
 * @extends {DividerProps} Inherits Material-UI Divider props
 */
export interface SeparatorProps extends DividerProps {
  /** Direction of the separator */
  orientation?: 'horizontal' | 'vertical'
  /** Whether the separator is decorative (for accessibility) */
  decorative?: boolean
}

const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  ({ orientation = 'horizontal', ...props }, ref) => {
    return (
      <Divider
        ref={ref}
        orientation={orientation}
        sx={{
          my: orientation === 'horizontal' ? 2 : 0,
          mx: orientation === 'vertical' ? 2 : 0,
        }}
        {...props}
      />
    )
  }
)

Separator.displayName = 'Separator'

export { Separator }
