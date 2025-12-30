import React, { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  sm?: boolean
  md?: boolean
  lg?: boolean
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ sm, md, lg, error, className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`input ${sm ? 'input--sm' : ''} ${md ? 'input--md' : ''} ${lg ? 'input--lg' : ''} ${error ? 'input--error' : ''} ${className}`}
      {...props}
    />
  )
)

Input.displayName = 'Input'
