import React, { forwardRef } from 'react'

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  primary?: boolean
  secondary?: boolean
  sm?: boolean
  extended?: boolean
}

export const Fab = forwardRef<HTMLButtonElement, FabProps>(
  ({ children, primary, secondary, sm, extended, className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`fab ${primary ? 'fab--primary' : ''} ${secondary ? 'fab--secondary' : ''} ${sm ? 'fab--sm' : ''} ${extended ? 'fab--extended' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
)

Fab.displayName = 'Fab'
