import React, { forwardRef } from 'react'

export const Switch = forwardRef(({ label, className = '', ...props }, ref) => (
  <label className={`switch ${className}`}>
    <input ref={ref} type="checkbox" className="switch-input" {...props} />
    <span className="switch-track" />
    {label && <span className="switch-label">{label}</span>}
  </label>
))
