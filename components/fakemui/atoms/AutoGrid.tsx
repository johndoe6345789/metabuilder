import React from 'react'

export interface AutoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  sm?: boolean
  lg?: boolean
  gap?: string | number
}

export const AutoGrid: React.FC<AutoGridProps> = ({ children, sm, lg, gap, className = '', ...props }) => (
  <div
    className={`auto-grid ${sm ? 'auto-grid--sm' : ''} ${lg ? 'auto-grid--lg' : ''} ${gap ? `gap-${gap}` : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
)
