import React, { forwardRef } from 'react'

export const Box = forwardRef(({ children, component: Component = 'div', className = '', ...props }, ref) => (
  <Component ref={ref} className={className} {...props}>{children}</Component>
))
