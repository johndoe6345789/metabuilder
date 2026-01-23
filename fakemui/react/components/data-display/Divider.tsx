import React from 'react'

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  vertical?: boolean
}

export const Divider: React.FC<DividerProps> = ({ vertical, className = '', ...props }) => (
  <hr className={`divider ${vertical ? 'divider--vertical' : ''} ${className}`} {...props} />
)
