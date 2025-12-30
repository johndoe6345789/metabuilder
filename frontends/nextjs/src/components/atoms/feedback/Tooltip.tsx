'use client'

import { Tooltip as FakemuiTooltip } from '@/fakemui'
import { forwardRef, ReactElement, ReactNode } from 'react'

/**
 * Props for the Tooltip component
 * Wrapper around fakemui Tooltip to maintain API compatibility
 */
export interface TooltipProps {
  /** The element that triggers the tooltip */
  children: ReactElement
  /** Title or main content of the tooltip */
  title?: ReactNode
  /** Alias for title - main content of the tooltip */
  content?: ReactNode
  /** Position of the tooltip relative to its trigger */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Delay in milliseconds before showing the tooltip */
  delayDuration?: number
  /** Whether to display an arrow pointing to the trigger element */
  arrow?: boolean
  /** Controlled open state */
  open?: boolean
  /** Callback when tooltip is opened */
  onOpen?: () => void
  /** Callback when tooltip is closed */
  onClose?: () => void
  /** MUI placement prop (mapped to side) */
  placement?: 'top' | 'right' | 'bottom' | 'left'
  /** MUI enterDelay prop (mapped to delayDuration) */
  enterDelay?: number
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      children,
      content,
      title,
      side,
      placement,
      delayDuration,
      enterDelay,
      arrow = true,
      open,
      onOpen,
      onClose,
      ...props
    },
    ref
  ) => {
    return (
      <FakemuiTooltip
        title={content || title || ''}
        placement={side || placement || 'top'}
        arrow={arrow}
        open={open}
        {...props}
      >
        {children}
      </FakemuiTooltip>
    )
  }
)

Tooltip.displayName = 'Tooltip'

// Compatibility exports
const TooltipTrigger = ({ children }: { children: ReactElement }) => children
const TooltipContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
