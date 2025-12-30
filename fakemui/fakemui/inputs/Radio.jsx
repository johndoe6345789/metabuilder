import React, { forwardRef } from 'react'

export const Radio = forwardRef(({ label, className = '', ...props }, ref) => (
  <label className={`radio ${className}`}>
    <input ref={ref} type="radio" className="radio-input" {...props} />
    <span className="radio-dot" />
    {label && <span className="radio-label">{label}</span>}
  </label>
))
