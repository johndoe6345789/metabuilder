import React, { forwardRef } from 'react'

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className = '', ...props }, ref) => (
    <label className={`switch ${className}`}>
      <input ref={ref} type="checkbox" className="switch-input" {...props} />
      <span className="switch-track" />
      {label && <span className="switch-label">{label}</span>}
    </label>
  )
)

Switch.displayName = 'Switch'
