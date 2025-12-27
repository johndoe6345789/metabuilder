'use client'

import { forwardRef, ReactNode } from 'react'

interface SelectContentProps {
  children: ReactNode
  className?: string
}

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
})

SelectContent.displayName = 'SelectContent'

export { SelectContent }
