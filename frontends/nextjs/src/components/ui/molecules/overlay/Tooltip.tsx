'use client'

import { Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

interface TooltipProviderProps {
  children: ReactNode
  delayDuration?: number
  skipDelayDuration?: number
  disableHoverableContent?: boolean
}

const TooltipProvider = ({ children }: TooltipProviderProps) => <>{children}</>
TooltipProvider.displayName = 'TooltipProvider'

interface TooltipProps {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
}

const Tooltip = ({ children }: TooltipProps) => <>{children}</>
Tooltip.displayName = 'Tooltip'

interface TooltipTriggerProps {
  children: ReactNode
  asChild?: boolean
}

const TooltipTrigger = forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children, ...props }, ref) => {
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} {...props}>
        {children}
      </span>
    )
  }
)
TooltipTrigger.displayName = 'TooltipTrigger'

interface TooltipContentProps {
  children: ReactNode
  className?: string
  sideOffset?: number
  side?: 'top' | 'right' | 'bottom' | 'left'
}

const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, side = 'top', sideOffset = 4 }, ref) => {
    return (
      <MuiTooltip
        ref={ref as React.Ref<HTMLDivElement>}
        title={children}
        placement={side}
        arrow
        slotProps={{
          tooltip: {
            sx: {
              bgcolor: 'grey.900',
              color: 'common.white',
              fontSize: '0.75rem',
              px: 1.5,
              py: 0.75,
              borderRadius: 1,
            },
          },
        }}
      >
        <span>{children}</span>
      </MuiTooltip>
    )
  }
)
TooltipContent.displayName = 'TooltipContent'

// Simpler Tooltip wrapper that works with MUI pattern
interface SimpleTooltipProps {
  title: ReactNode
  children: ReactNode
  placement?: MuiTooltipProps['placement']
}

const SimpleTooltip = ({ title, children, placement = 'top' }: SimpleTooltipProps) => {
  return (
    <MuiTooltip
      title={title}
      placement={placement}
      arrow
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: 'grey.900',
            color: 'common.white',
            fontSize: '0.75rem',
            px: 1.5,
            py: 0.75,
            borderRadius: 1,
          },
        },
      }}
    >
      <span>{children}</span>
    </MuiTooltip>
  )
}

export { SimpleTooltip,Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
