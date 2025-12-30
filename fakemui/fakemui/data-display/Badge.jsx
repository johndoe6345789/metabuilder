import React from 'react'

export const Badge = ({ children, content, dot, overlap, color, className = '', ...props }) => (
  <span className={`badge-wrapper ${className}`} {...props}>
    {children}
    <span className={`badge ${dot ? 'badge--dot' : ''} ${overlap ? 'badge--overlap' : ''} ${color ? `badge--${color}` : ''}`}>{!dot && content}</span>
  </span>
)
