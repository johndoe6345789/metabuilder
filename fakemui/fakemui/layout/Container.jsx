import React from 'react'

export const Container = ({ children, maxWidth, disableGutters, className = '', ...props }) => (
  <div className={`container ${maxWidth ? `container--${maxWidth}` : ''} ${disableGutters ? 'container--no-gutters' : ''} ${className}`} {...props}>{children}</div>
)
