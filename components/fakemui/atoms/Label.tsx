import React from 'react'

export interface LabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
}

export const Label: React.FC<LabelProps> = ({ children, className = '', ...props }) => (
  <span className={`label ${className}`} {...props}>
    {children}
  </span>
)
