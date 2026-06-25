import React from 'react'

export interface AutoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  sm?: boolean
  lg?: boolean
  gap?: string | number
  /** Test ID for automated testing */
  testId?: string
}

export const AutoGrid: React.FC<AutoGridProps> = ({ children, sm, lg, gap, testId, className = '', ...props }) => (
  <div
    className={`auto-grid ${sm ? 'auto-grid--sm' : ''} ${lg ? 'auto-grid--lg' : ''} ${gap ? `gap-${gap}` : ''} ${className}`}
    data-testid={testId}
    {...props}
  >
    {children}
  </div>
)
