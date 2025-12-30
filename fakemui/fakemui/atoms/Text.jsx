import React from 'react'

export const Text = ({ children, secondary, disabled, sm, xs, lg, mono, center, truncate, className = '', as: Tag = 'span', ...props }) => (
  <Tag className={`${secondary ? 'text-secondary' : ''} ${disabled ? 'text-disabled' : ''} ${sm ? 'text-sm' : ''} ${xs ? 'text-xs' : ''} ${lg ? 'text-lg' : ''} ${mono ? 'font-mono' : ''} ${center ? 'text-center' : ''} ${truncate ? 'truncate' : ''} ${className}`} {...props}>{children}</Tag>
)
