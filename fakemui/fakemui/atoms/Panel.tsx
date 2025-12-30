import React from 'react'

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const Panel: React.FC<PanelProps> = ({ children, className = '', ...props }) => (
  <div className={`panel ${className}`} {...props}>
    {children}
  </div>
)
