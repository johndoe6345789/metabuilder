import React, { forwardRef } from 'react'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = '', ...props }, ref) => (
    <label className={`radio ${className}`}>
      <input ref={ref} type="radio" className="radio-input" {...props} />
      <span className="radio-dot" />
      {label && <span className="radio-label">{label}</span>}
    </label>
  )
)

Radio.displayName = 'Radio'
