import React, { forwardRef } from 'react'

export type LinkUnderline = 'none' | 'hover' | 'always'

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode
  underline?: LinkUnderline
  color?: string
  /** Test ID for automated testing */
  testId?: string
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ children, underline = 'hover', color, className = '', testId, ...props }, ref) => (
    <a
      ref={ref}
      className={`link link--underline-${underline} ${color ? `link--${color}` : ''} ${className}`}
      data-testid={testId}
      {...props}
    >
      {children}
    </a>
  )
)

Link.displayName = 'Link'
