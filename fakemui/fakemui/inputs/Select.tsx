import React, { forwardRef } from 'react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children?: React.ReactNode
  sm?: boolean
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, sm, error, className = '', ...props }, ref) => (
    <select
      ref={ref}
      className={`select ${sm ? 'select--sm' : ''} ${error ? 'select--error' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
)

Select.displayName = 'Select'
