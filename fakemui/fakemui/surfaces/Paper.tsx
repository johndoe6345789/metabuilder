import React from 'react'

export interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  elevation?: number
  square?: boolean
}

export const Paper: React.FC<PaperProps> = ({ children, elevation = 1, square, className = '', ...props }) => (
  <div className={`paper paper--elevation-${elevation} ${square ? 'paper--square' : ''} ${className}`} {...props}>
    {children}
  </div>
)
