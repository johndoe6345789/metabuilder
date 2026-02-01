import React from 'react'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  src?: string
  alt?: string
  sm?: boolean
  md?: boolean
  lg?: boolean
  xl?: boolean
}

export const Avatar: React.FC<AvatarProps> = ({ children, src, alt = '', sm, md, lg, xl, className = '', ...props }) => (
  <div
    className={`avatar flex-center ${sm ? 'avatar--sm' : ''} ${md ? 'avatar--md' : ''} ${lg ? 'avatar--lg' : ''} ${xl ? 'avatar--xl' : ''} ${className}`}
    {...props}
  >
    {src ? <img src={src} alt={alt} /> : children}
  </div>
)

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  max?: number
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ children, max, className = '', ...props }) => (
  <div className={`avatar-group ${className}`} {...props}>
    {children}
  </div>
)
