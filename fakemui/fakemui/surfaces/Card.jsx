import React, { forwardRef } from 'react'

export const Card = ({ children, clickable, raised, className = '', ...props }) => (
  <div className={`card ${clickable ? 'card--clickable' : ''} ${raised ? 'card--raised' : ''} ${className}`} {...props}>{children}</div>
)

export const CardHeader = ({ title, subheader, action, avatar, className = '', ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {avatar && <div className="card-header-avatar">{avatar}</div>}
    <div className="card-header-content">
      {title && <div className="card-header-title">{title}</div>}
      {subheader && <div className="card-header-subheader">{subheader}</div>}
    </div>
    {action && <div className="card-header-action">{action}</div>}
  </div>
)

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`card-content ${className}`} {...props}>{children}</div>
)

export const CardActions = ({ children, disableSpacing, className = '', ...props }) => (
  <div className={`card-actions ${disableSpacing ? 'card-actions--no-spacing' : ''} ${className}`} {...props}>{children}</div>
)

export const CardActionArea = forwardRef(({ children, className = '', ...props }, ref) => (
  <button ref={ref} className={`card-action-area ${className}`} {...props}>{children}</button>
))

export const CardMedia = ({ image, alt = '', height, className = '', ...props }) => (
  <div className={`card-media ${className}`} style={{ backgroundImage: `url(${image})`, height }} {...props} role="img" aria-label={alt} />
)
