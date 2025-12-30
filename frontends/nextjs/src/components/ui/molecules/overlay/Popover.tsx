'use client'

import { Box } from '@/fakemui/fakemui/layout'
import { forwardRef, ReactNode } from 'react'
import styles from './Popover.module.scss'

interface PopoverProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Popover = ({ children }: PopoverProps) => <>{children}</>
Popover.displayName = 'Popover'

interface PopoverTriggerProps {
  children: ReactNode
  asChild?: boolean
  className?: string
}

const PopoverTrigger = forwardRef<HTMLDivElement, PopoverTriggerProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <Box ref={ref} className={`${styles.popoverTrigger} ${className}`} {...props}>
        {children}
      </Box>
    )
  }
)
PopoverTrigger.displayName = 'PopoverTrigger'

interface PopoverContentProps {
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  className?: string
}

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, align = 'center', sideOffset = 4, className = '', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={`${styles.popoverContent} ${className}`}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
PopoverContent.displayName = 'PopoverContent'

const PopoverAnchor = forwardRef<HTMLDivElement, { children?: ReactNode; className?: string }>(
  ({ children, className = '', ...props }, ref) => (
    <Box ref={ref} className={className} {...props}>
      {children}
    </Box>
  )
)
PopoverAnchor.displayName = 'PopoverAnchor'

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }
