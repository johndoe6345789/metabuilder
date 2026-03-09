import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link' | 'outlined' | string
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'small' | string
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant: _variant, size: _size, asChild: _asChild, ...props }, ref) => (
    <button ref={ref} className={className} {...props} />
  )
)
Button.displayName = 'Button'
