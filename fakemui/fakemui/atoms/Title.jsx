import React from 'react'

export const Title = ({ children, page, card, truncate, className = '', as: Tag = 'h2', ...props }) => (
  <Tag className={`${page ? 'page-title' : ''} ${card ? 'card-title' : ''} ${truncate ? 'truncate' : ''} ${className}`} {...props}>{children}</Tag>
)

export const Subtitle = ({ children, className = '', ...props }) => (
  <p className={`page-subtitle ${className}`} {...props}>{children}</p>
)
