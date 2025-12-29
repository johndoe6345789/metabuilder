'use client'

import { forwardRef, ReactElement, ReactNode, type ComponentProps } from 'react'
import { Tooltip as MuiTooltip } from '@mui/material'

type MuiTooltipProps = ComponentProps<typeof MuiTooltip>

/**
 * Props for the Tooltip component
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
}

const sideMap: Record<string, MuiTooltipProps['placement']> = {
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  left: 'left',
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      children,
      content,
      title,
      side = 'top',
      delayDuration = 300,
      arrow = true,
      open,
      onOpen,
      onClose,
      ...props
    },
    ref
  ) => {
    return (
      <MuiTooltip
        title={content || title || ''}
        placement={sideMap[side]}
        enterDelay={delayDuration}
        arrow={arrow}
        open={open}
        onOpen={onOpen}
        onClose={onClose}
      >
        {children}
      </MuiTooltip>
    )
  }
)

Tooltip.displayName = 'Tooltip'

// Compatibility exports
const TooltipTrigger = ({ children }: { children: ReactElement }) => children
const TooltipContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
