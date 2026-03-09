import React from 'react'

export interface TooltipProps {
  children?: React.ReactNode
}

export interface TooltipProviderProps {
  children?: React.ReactNode
  delayDuration?: number
}

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  asChild?: boolean
}

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  hidden?: boolean
  sideOffset?: number
}

export const Tooltip: React.FC<TooltipProps> = ({ children }) => <>{children}</>

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => <>{children}</>

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ children, asChild: _asChild, ...props }) => (
  <span {...props}>{children}</span>
)

export const TooltipContent: React.FC<TooltipContentProps> = ({ children, hidden, side: _side, align: _align, sideOffset: _sideOffset, ...props }) => (
  hidden ? null : <div {...props}>{children}</div>
)
