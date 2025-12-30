'use client'

import { forwardRef, ReactNode } from 'react'

import { Box } from '@/fakemui'

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
