'use client'

import { forwardRef, ReactNode } from 'react'

import { Box, Popover as FakeMuiPopover } from '@/fakemui'

// Popover container
export interface PopoverProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Popover = ({ children, open, onOpenChange }: PopoverProps) => {
  return <>{children}</>
}
Popover.displayName = 'Popover'

// PopoverTrigger
interface PopoverTriggerProps {
  children: ReactNode
  asChild?: boolean
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

const PopoverTrigger = forwardRef<HTMLDivElement, PopoverTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        onClick={onClick}
        className="popover-trigger"
        {...props}
      >
        {children}
      </Box>
    )
  }
)
PopoverTrigger.displayName = 'PopoverTrigger'

// PopoverContent
export interface PopoverContentProps {
  children?: ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  anchorEl?: HTMLElement | null
  onClose?: () => void
  className?: string
}

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    { children, align = 'center', side = 'bottom', sideOffset = 4, anchorEl, onClose, className, ...props },
    ref
  ) => {
    const anchorOrigin = {
      vertical: side === 'top' ? 'top' : 'bottom',
      horizontal: align === 'end' ? 'right' : align === 'center' ? 'center' : 'left',
    } as const

    return (
      <FakeMuiPopover
        ref={ref}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={{
          vertical: side === 'top' ? 'bottom' : 'top',
          horizontal: anchorOrigin.horizontal,
        }}
        className={`popover-content ${className || ''}`}
        {...props}
      >
        {children}
      </FakeMuiPopover>
    )
  }
)
PopoverContent.displayName = 'PopoverContent'

// PopoverAnchor
const PopoverAnchor = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} className="popover-anchor" {...props}>
        {children}
      </Box>
    )
  }
)
PopoverAnchor.displayName = 'PopoverAnchor'

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }
