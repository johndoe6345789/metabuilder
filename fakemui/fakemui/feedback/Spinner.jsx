import React from 'react'

export const Spinner = ({ sm, lg, className = '', ...props }) => (
  <div className={`spinner ${sm ? 'spinner--sm' : ''} ${lg ? 'spinner--lg' : ''} ${className}`} {...props} />
)

export const CircularProgress = Spinner // alias
