import React, { forwardRef } from 'react'

export interface ToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  selected?: boolean
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ children, selected, className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`toggle-btn ${selected ? 'toggle-btn--selected' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
)

ToggleButton.displayName = 'ToggleButton'

export interface ToggleButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({ children, className = '', ...props }) => (
  <div className={`toggle-btn-group ${className}`} {...props}>
    {children}
  </div>
)
