import React, { forwardRef } from 'react'

export const Checkbox = forwardRef(({ label, className = '', ...props }, ref) => (
  <label className={`checkbox ${className}`}>
    <input ref={ref} type="checkbox" className="checkbox-input" {...props} />
    <span className="checkbox-box" />
    {label && <span className="checkbox-label">{label}</span>}
  </label>
))
