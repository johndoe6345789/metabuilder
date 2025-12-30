import React from 'react'

export const Skeleton = ({ variant = 'text', width, height, className = '', ...props }) => (
  <div className={`skeleton skeleton--${variant} ${className}`} style={{ width, height }} {...props} />
)
