'use client'

import { forwardRef } from 'react'
import { Divider, DividerProps } from '@mui/material'

export interface SeparatorProps extends DividerProps {
  orientation?: 'horizontal' | 'vertical'
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
