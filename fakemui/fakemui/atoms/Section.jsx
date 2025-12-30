import React from 'react'

export const Section = ({ children, sm, className = '', ...props }) => (
  <div className={`section ${sm ? 'section--sm' : ''} ${className}`} {...props}>{children}</div>
)

export const SectionHeader = ({ children, className = '', ...props }) => (
  <div className={`section-header ${className}`} {...props}>{children}</div>
)

export const SectionTitle = ({ children, className = '', ...props }) => (
  <h3 className={`section-title ${className}`} {...props}>{children}</h3>
)

export const SectionContent = ({ children, className = '', ...props }) => (
  <div className={`section-content ${className}`} {...props}>{children}</div>
)
