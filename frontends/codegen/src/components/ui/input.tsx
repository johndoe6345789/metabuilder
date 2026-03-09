import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error: _error, ...props }, ref) => (
    <input ref={ref} className={className} {...props} />
  )
)
Input.displayName = 'Input'
