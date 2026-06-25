import React, { useId } from 'react'

export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  title?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip: React.FC<TooltipProps> = ({ children, title, placement = 'top', className = '', ...props }) => {
  const tooltipId = useId()

  return (
    <span
      className={`tooltip-wrapper ${className}`}
      data-tooltip={title}
      data-placement={placement}
      aria-describedby={title ? tooltipId : undefined}
      {...props}
    >
      {children}
      {title && (
        <span id={tooltipId} role="tooltip" style={{
          position: 'absolute', width: '1px', height: '1px',
          overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap'
        }}>
          {title}
        </span>
      )}
    </span>
  )
}
