import React from 'react'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  sm?: boolean
  lg?: boolean
}

export const Spinner: React.FC<SpinnerProps> = ({ sm, lg, className = '', ...props }) => (
  <div className={`spinner ${sm ? 'spinner--sm' : ''} ${lg ? 'spinner--lg' : ''} ${className}`} {...props} />
)

export const CircularProgress = Spinner // alias
