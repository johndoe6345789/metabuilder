import React, { forwardRef } from 'react'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  sm?: boolean
  lg?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, sm, lg, className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`icon-btn ${sm ? 'icon-btn--sm' : ''} ${lg ? 'icon-btn--lg' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
)

IconButton.displayName = 'IconButton'
