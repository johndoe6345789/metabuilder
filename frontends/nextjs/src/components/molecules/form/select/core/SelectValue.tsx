'use client'

import { Box } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

interface SelectValueProps {
  placeholder?: string
  children?: ReactNode
}

const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(({ placeholder, children, ...props }, ref) => {
  return (
    <Box component="span" ref={ref} sx={{ color: children ? 'text.primary' : 'text.secondary' }} {...props}>
      {children || placeholder}
    </Box>
  )
})

SelectValue.displayName = 'SelectValue'

export { SelectValue }
