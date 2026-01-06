import React from 'react'

export interface ImageListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  cols?: number
  gap?: string | number
}

export const ImageList: React.FC<ImageListProps> = ({ children, cols = 2, gap, className = '', ...props }) => (
  <div className={`image-list image-list--cols-${cols} ${gap ? `gap-${gap}` : ''} ${className}`} {...props}>
    {children}
  </div>
)

export interface ImageListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  cols?: number
  rows?: number
}

export const ImageListItem: React.FC<ImageListItemProps> = ({
  children,
  cols = 1,
  rows = 1,
  className = '',
  ...props
}) => (
  <div
    className={`image-list-item ${className}`}
    style={{ gridColumn: `span ${cols}`, gridRow: `span ${rows}` }}
    {...props}
  >
    {children}
  </div>
)

export interface ImageListItemBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actionIcon?: React.ReactNode
  position?: 'top' | 'bottom'
}

export const ImageListItemBar: React.FC<ImageListItemBarProps> = ({
  title,
  subtitle,
  actionIcon,
  position = 'bottom',
  className = '',
  ...props
}) => (
  <div className={`image-list-item-bar image-list-item-bar--${position} ${className}`} {...props}>
    <div className="image-list-item-bar-content">
      {title && <span className="image-list-item-bar-title">{title}</span>}
      {subtitle && <span className="image-list-item-bar-subtitle">{subtitle}</span>}
    </div>
    {actionIcon && <span className="image-list-item-bar-action">{actionIcon}</span>}
  </div>
)
