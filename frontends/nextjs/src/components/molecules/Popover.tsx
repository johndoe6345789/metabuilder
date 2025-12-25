'use client'

import { forwardRef, ReactNode } from 'react'
import { Popover as MuiPopover, PopoverProps as MuiPopoverProps, Box } from '@mui/material'

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
        sx={{ display: 'inline-flex', cursor: 'pointer' }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
PopoverTrigger.displayName = 'PopoverTrigger'

// PopoverContent
export interface PopoverContentProps extends Omit<MuiPopoverProps, 'open'> {
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
}

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, align = 'center', side = 'bottom', sideOffset = 4, anchorEl, onClose, ...props }, ref) => {
    const anchorOrigin = {
      vertical: side === 'top' ? 'top' : 'bottom',
      horizontal: align === 'end' ? 'right' : align === 'center' ? 'center' : 'left',
    } as const

    return (
      <MuiPopover
        ref={ref}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={{
          vertical: side === 'top' ? 'bottom' : 'top',
          horizontal: anchorOrigin.horizontal,
        }}
        PaperProps={{
          sx: {
            p: 2,
            borderRadius: 1,
            boxShadow: 3,
            mt: sideOffset / 8,
          },
        }}
        {...props}
      >
        {children}
      </MuiPopover>
    )
  }
)
PopoverContent.displayName = 'PopoverContent'

// PopoverAnchor
const PopoverAnchor = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ display: 'inline-flex' }} {...props}>
        {children}
      </Box>
    )
  }
)
PopoverAnchor.displayName = 'PopoverAnchor'

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
