import React, { forwardRef } from 'react'

export const Input = forwardRef(({ sm, md, lg, error, className = '', ...props }, ref) => (
  <input ref={ref} className={`input ${sm ? 'input--sm' : ''} ${md ? 'input--md' : ''} ${lg ? 'input--lg' : ''} ${error ? 'input--error' : ''} ${className}`} {...props} />
))
