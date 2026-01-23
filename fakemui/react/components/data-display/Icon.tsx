import React from 'react'

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
  sm?: boolean
  lg?: boolean
  color?: string
}

export const Icon: React.FC<IconProps> = ({ children, sm, lg, color, className = '', ...props }) => (
  <span
    className={`icon ${sm ? 'icon--sm' : ''} ${lg ? 'icon--lg' : ''} ${color ? `icon--${color}` : ''} ${className}`}
    {...props}
  >
    {children}
  </span>
)
