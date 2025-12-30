'use client'

import { Tooltip as FakeMuiTooltip } from '@/fakemui/fakemui/data-display'
import { forwardRef, ReactNode } from 'react'
import styles from './Tooltip.module.scss'

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

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
  side?: TooltipPlacement
}

const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, side = 'top', className = '' }, ref) => {
    return (
      <FakeMuiTooltip
        ref={ref as React.Ref<HTMLSpanElement>}
        title={typeof children === 'string' ? children : ''}
        placement={side}
        className={`${styles.tooltipContent} ${className}`}
      >
        <span>{children}</span>
      </FakeMuiTooltip>
    )
  }
)
TooltipContent.displayName = 'TooltipContent'

// Simpler Tooltip wrapper that works with fakemui pattern
interface SimpleTooltipProps {
  title: ReactNode
  children: ReactNode
  placement?: TooltipPlacement
  className?: string
}

const SimpleTooltip = ({ title, children, placement = 'top', className = '' }: SimpleTooltipProps) => {
  return (
    <FakeMuiTooltip
      title={typeof title === 'string' ? title : ''}
      placement={placement}
      className={`${styles.simpleTooltip} ${className}`}
    >
      <span>{children}</span>
    </FakeMuiTooltip>
  )
}

export { SimpleTooltip, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
