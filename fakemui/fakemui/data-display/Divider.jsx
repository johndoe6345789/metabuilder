import React from 'react'

export const Divider = ({ vertical, className = '', ...props }) => (
  <hr className={`divider ${vertical ? 'divider--vertical' : ''} ${className}`} {...props} />
)
