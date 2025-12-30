import React, { forwardRef } from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  primary?: boolean
  secondary?: boolean
  outline?: boolean
  ghost?: boolean
  sm?: boolean
  lg?: boolean
  icon?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, primary, secondary, outline, ghost, sm, lg, icon, loading, disabled, className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`btn ${primary ? 'btn--primary' : ''} ${secondary ? 'btn--secondary' : ''} ${outline ? 'btn--outline' : ''} ${ghost ? 'btn--ghost' : ''} ${sm ? 'btn--sm' : ''} ${lg ? 'btn--lg' : ''} ${icon ? 'btn--icon' : ''} ${loading ? 'btn--loading' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = 'Button'
