import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  content?: React.ReactNode
  dot?: boolean
  overlap?: boolean
  color?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, content, dot, overlap, color, className = '', ...props }) => (
  <span className={`badge-wrapper ${className}`} {...props}>
    {children}
    <span
      className={`badge ${dot ? 'badge--dot' : ''} ${overlap ? 'badge--overlap' : ''} ${color ? `badge--${color}` : ''}`}
    >
      {!dot && content}
    </span>
  </span>
)
