'use client'

import { Box } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

interface SelectGroupProps {
  children: ReactNode
  className?: string
}

const SelectGroup = forwardRef<HTMLDivElement, SelectGroupProps>(({ children, ...props }, ref) => {
  return (
    <Box ref={ref} {...props}>
      {children}
    </Box>
  )
})

SelectGroup.displayName = 'SelectGroup'

export { SelectGroup }
