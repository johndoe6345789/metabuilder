import React from 'react'

export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  title?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip: React.FC<TooltipProps> = ({ children, title, placement = 'top', className = '', ...props }) => (
  <span
    className={`tooltip-wrapper ${className}`}
    data-tooltip={title}
    data-placement={placement}
    {...props}
  >
    {children}
  </span>
)
