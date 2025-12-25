'use client'

import { forwardRef, ReactElement, ReactNode } from 'react'
import { 
  Tooltip as MuiTooltip, 
  TooltipProps as MuiTooltipProps,
} from '@mui/material'

export interface TooltipProps {
  children: ReactElement
  title?: ReactNode
  content?: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  delayDuration?: number
  arrow?: boolean
  open?: boolean
  onOpen?: () => void
  onClose?: () => void
}

const sideMap: Record<string, MuiTooltipProps['placement']> = {
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  left: 'left',
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ children, content, title, side = 'top', delayDuration = 300, arrow = true, open, onOpen, onClose, ...props }, ref) => {
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
