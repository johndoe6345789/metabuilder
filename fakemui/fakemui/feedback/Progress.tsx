import React from 'react'

export interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  indeterminate?: boolean
}

export const LinearProgress: React.FC<LinearProgressProps> = ({ value, indeterminate, className = '', ...props }) => (
  <div className={`progress ${indeterminate ? 'progress--indeterminate' : ''} ${className}`} {...props}>
    <div className="progress-bar" style={value !== undefined ? { width: `${value}%` } : undefined} />
  </div>
)

export const Progress = LinearProgress // alias
