import React, { forwardRef } from 'react'

export const Link = forwardRef(({ children, underline = 'hover', color, className = '', ...props }, ref) => (
  <a ref={ref} className={`link link--underline-${underline} ${color ? `link--${color}` : ''} ${className}`} {...props}>{children}</a>
))
