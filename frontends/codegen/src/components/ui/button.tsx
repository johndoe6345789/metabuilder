import React from 'react'

type Variant =
  | 'default' | 'outline' | 'ghost' | 'destructive'
  | 'secondary' | 'link' | 'outlined' | string

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'small' | string
  asChild?: boolean
}

export const Button = React.forwardRef<
  HTMLButtonElement, ButtonProps
>(
  (
    { className = '', variant: _v, size: _s,
      asChild: _a, ...props },
    ref,
  ) => <button ref={ref} className={className} {...props} />,
)
Button.displayName = 'Button'
