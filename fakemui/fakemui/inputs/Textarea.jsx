import React, { forwardRef } from 'react'

export const Textarea = forwardRef(({ error, className = '', ...props }, ref) => (
  <textarea ref={ref} className={`textarea ${error ? 'textarea--error' : ''} ${className}`} {...props} />
))
