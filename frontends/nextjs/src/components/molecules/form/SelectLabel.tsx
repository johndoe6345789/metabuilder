'use client'

import { Box } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

interface SelectLabelProps {
  children: ReactNode
  className?: string
}

const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(({ children, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      sx={{ px: 2, py: 1, fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}
      {...props}
    >
      {children}
    </Box>
  )
})

SelectLabel.displayName = 'SelectLabel'

export { SelectLabel }
