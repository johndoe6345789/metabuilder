import React, { forwardRef } from 'react'

export const Slider = forwardRef(({ className = '', ...props }, ref) => (
  <input ref={ref} type="range" className={`slider ${className}`} {...props} />
))
