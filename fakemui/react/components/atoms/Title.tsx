import React from 'react'

export interface TitleProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  page?: boolean
  card?: boolean
  truncate?: boolean
  as?: React.ElementType
}

export const Title: React.FC<TitleProps> = ({
  children,
  page,
  card,
  truncate,
  className = '',
  as: Tag = 'h2',
  ...props
}) => (
  <Tag
    className={`${page ? 'page-title' : ''} ${card ? 'card-title' : ''} ${truncate ? 'truncate' : ''} ${className}`}
    {...props}
  >
    {children}
  </Tag>
)

export interface SubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
}

export const Subtitle: React.FC<SubtitleProps> = ({ children, className = '', ...props }) => (
  <p className={`page-subtitle ${className}`} {...props}>
    {children}
  </p>
)
