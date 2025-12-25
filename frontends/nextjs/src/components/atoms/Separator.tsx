'use client'

import { forwardRef } from 'react'
import { Divider, DividerProps } from '@mui/material'

export interface SeparatorProps extends DividerProps {
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
