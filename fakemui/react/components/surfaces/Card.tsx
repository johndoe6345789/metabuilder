import React, { forwardRef } from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  clickable?: boolean
  raised?: boolean
}

export const Card: React.FC<CardProps> = ({ children, clickable, raised, className = '', ...props }) => (
  <div className={`card ${clickable ? 'card--clickable' : ''} ${raised ? 'card--raised' : ''} ${className}`} {...props}>
    {children}
  </div>
)

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode
  subheader?: React.ReactNode
  action?: React.ReactNode
  avatar?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subheader, action, avatar, className = '', ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {avatar && <div className="card-header-avatar">{avatar}</div>}
    <div className="card-header-content">
      {title && <div className="card-header-title">{title}</div>}
      {subheader && <div className="card-header-subheader">{subheader}</div>}
    </div>
    {action && <div className="card-header-action">{action}</div>}
  </div>
)

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '', ...props }) => (
  <div className={`card-content ${className}`} {...props}>
    {children}
  </div>
)

export interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  disableSpacing?: boolean
}

export const CardActions: React.FC<CardActionsProps> = ({ children, disableSpacing, className = '', ...props }) => (
  <div className={`card-actions ${disableSpacing ? 'card-actions--no-spacing' : ''} ${className}`} {...props}>
    {children}
  </div>
)

export interface CardActionAreaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

export const CardActionArea = forwardRef<HTMLButtonElement, CardActionAreaProps>(
  ({ children, className = '', ...props }, ref) => (
    <button ref={ref} className={`card-action-area ${className}`} {...props}>
      {children}
    </button>
  )
)

CardActionArea.displayName = 'CardActionArea'

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string
  alt?: string
  height?: string | number
}

export const CardMedia: React.FC<CardMediaProps> = ({ image, alt = '', height, className = '', ...props }) => (
  <div
    className={`card-media ${className}`}
    style={{ backgroundImage: `url(${image})`, height }}
    {...props}
    role="img"
    aria-label={alt}
  />
)

// Additional Card subcomponents for scripted package compatibility
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
  text?: string
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, text, className = '', ...props }) => (
  <h3 className={`card-title ${className}`} {...props}>
    {text || children}
  </h3>
)

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
  text?: string
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, text, className = '', ...props }) => (
  <p className={`card-description ${className}`} {...props}>
    {text || children}
  </p>
)

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '', ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
)
