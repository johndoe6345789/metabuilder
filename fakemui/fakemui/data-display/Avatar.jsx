import React from 'react'

export const Avatar = ({ children, src, alt = '', sm, md, lg, xl, className = '', ...props }) => (
  <div className={`avatar flex-center ${sm ? 'avatar--sm' : ''} ${md ? 'avatar--md' : ''} ${lg ? 'avatar--lg' : ''} ${xl ? 'avatar--xl' : ''} ${className}`} {...props}>
    {src ? <img src={src} alt={alt} /> : children}
  </div>
)

export const AvatarGroup = ({ children, max, className = '', ...props }) => (
  <div className={`avatar-group ${className}`} {...props}>{children}</div>
)
