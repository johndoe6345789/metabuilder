import React, { forwardRef } from 'react'
import { FormLabel } from './FormLabel'
import { FormHelperText } from './FormHelperText'
import { Input } from './Input'

export const TextField = forwardRef(({ label, helperText, error, className = '', ...props }, ref) => (
  <div className={`text-field ${error ? 'text-field--error' : ''} ${className}`}>
    {label && <FormLabel>{label}</FormLabel>}
    <Input ref={ref} error={error} {...props} />
    {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
  </div>
))
