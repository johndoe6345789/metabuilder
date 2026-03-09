import React, { forwardRef } from 'react'
import { sxToStyle } from '../utils/sx'
import styles from '../../../scss/atoms/mat-card.module.scss'

const s = (key: string): string => styles[key] || key

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  clickable?: boolean
  raised?: boolean
  variant?: 'elevation' | 'elevated' | 'outlined' | 'filled'
  sx?: Record<string, unknown>
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, clickable, raised, variant = 'elevation', className = '', sx, style, ...props }, ref) => {
    // Map variant to Angular Material class names
    const variantClass = variant === 'outlined' ? s('mat-mdc-card-outlined')
      : variant === 'filled' ? s('mat-mdc-card-filled')
      : '' // elevation/elevated use base mat-mdc-card styling

    const classes = [
      s('mat-mdc-card'),
      variantClass,
      clickable ? styles.clickable : '',
      raised ? styles.raised : '',
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={ref}
        className={classes}
        style={{ ...sxToStyle(sx), ...style }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode
  subheader?: React.ReactNode
  action?: React.ReactNode
  avatar?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subheader, action, avatar, className = '', ...props }) => (
  <div className={`${s('mat-mdc-card-header')} ${className}`} {...props}>
    {avatar && <div className={s('mat-mdc-card-avatar')}>{avatar}</div>}
    <div className={`${s('mat-mdc-card-header-text')} ${styles.cardHeaderText}`}>
      {title && <div className={s('mat-mdc-card-title')}>{title}</div>}
      {subheader && <div className={s('mat-mdc-card-subtitle')}>{subheader}</div>}
    </div>
    {action && <div className={styles.cardHeaderAction}>{action}</div>}
  </div>
)

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  sx?: Record<string, unknown>
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '', sx, style, ...props }) => (
  <div className={`${s('mat-mdc-card-content')} ${className}`} style={{ ...sxToStyle(sx), ...style }} {...props}>
    {children}
  </div>
)

export interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  disableSpacing?: boolean
  sx?: Record<string, unknown>
}

export const CardActions: React.FC<CardActionsProps> = ({ children, disableSpacing, className = '', sx, style, ...props }) => {
  const classes = [
    s('mat-mdc-card-actions'),
    disableSpacing ? styles.actionsNoSpacing : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} style={{ ...sxToStyle(sx), ...style }} {...props}>
      {children}
    </div>
  )
}

export interface CardActionAreaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

export const CardActionArea = forwardRef<HTMLButtonElement, CardActionAreaProps>(
  ({ children, className = '', ...props }, ref) => (
    <button ref={ref} className={`${styles.cardActionArea} ${className}`} {...props}>
      {children}
    </button>
  )
)

CardActionArea.displayName = 'CardActionArea'

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string
  alt?: string
  height?: string | number
  component?: 'div' | 'img'
}

export const CardMedia: React.FC<CardMediaProps> = ({ image, alt = '', height, component = 'div', className = '', style, ...props }) => {
  if (component === 'img' && image) {
    return (
      <img
        src={image}
        alt={alt}
        className={`${s('mdc-card__media')} ${className}`}
        style={{ height, objectFit: 'cover', width: '100%', ...style }}
        {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
      />
    )
  }

  return (
    <div
      className={`${s('mdc-card__media')} ${className}`}
      style={{ backgroundImage: image ? `url(${image})` : undefined, height, ...style }}
      {...props}
      role="img"
      aria-label={alt}
    />
  )
}

// Additional Card subcomponents for scripted package compatibility
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
  text?: string
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, text, className = '', ...props }) => (
  <h3 className={`${s('mat-mdc-card-title')} ${className}`} {...props}>
    {text || children}
  </h3>
)

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
  text?: string
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, text, className = '', ...props }) => (
  <p className={`${s('mat-mdc-card-subtitle')} ${className}`} {...props}>
    {text || children}
  </p>
)

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '', ...props }) => (
  <div className={`${styles.cardFooter} ${className}`} {...props}>
    {children}
  </div>
)

// Title group component for complex layouts
export interface CardTitleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const CardTitleGroup: React.FC<CardTitleGroupProps> = ({ children, className = '', ...props }) => (
  <div className={`${s('mat-mdc-card-title-group')} ${className}`} {...props}>
    {children}
  </div>
)
