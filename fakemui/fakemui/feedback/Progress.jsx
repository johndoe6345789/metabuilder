import React from 'react'

export const LinearProgress = ({ value, indeterminate, className = '', ...props }) => (
  <div className={`progress ${indeterminate ? 'progress--indeterminate' : ''} ${className}`} {...props}>
    <div className="progress-bar" style={value !== undefined ? { width: `${value}%` } : undefined} />
  </div>
)

export const Progress = LinearProgress // alias
