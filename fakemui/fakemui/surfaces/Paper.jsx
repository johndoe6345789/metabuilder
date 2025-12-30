import React from 'react'

export const Paper = ({ children, elevation = 1, square, className = '', ...props }) => (
  <div className={`paper paper--elevation-${elevation} ${square ? 'paper--square' : ''} ${className}`} {...props}>{children}</div>
)
