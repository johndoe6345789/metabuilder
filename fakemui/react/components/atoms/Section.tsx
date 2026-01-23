import React from 'react'

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  sm?: boolean
}

export const Section: React.FC<SectionProps> = ({ children, sm, className = '', ...props }) => (
  <div className={`section ${sm ? 'section--sm' : ''} ${className}`} {...props}>
    {children}
  </div>
)

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ children, className = '', ...props }) => (
  <div className={`section-header ${className}`} {...props}>
    {children}
  </div>
)

export interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children, className = '', ...props }) => (
  <h3 className={`section-title ${className}`} {...props}>
    {children}
  </h3>
)

export interface SectionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const SectionContent: React.FC<SectionContentProps> = ({ children, className = '', ...props }) => (
  <div className={`section-content ${className}`} {...props}>
    {children}
  </div>
)
