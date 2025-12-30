import React from 'react'

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'caption' | 'overline'

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  variant?: TypographyVariant
  color?: string
  align?: 'left' | 'center' | 'right' | 'justify'
  gutterBottom?: boolean
  noWrap?: boolean
  as?: React.ElementType
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant,
  color,
  align,
  gutterBottom,
  noWrap,
  className = '',
  as,
  ...props
}) => {
  const Tag =
    as ||
    (variant === 'h1' ||
    variant === 'h2' ||
    variant === 'h3' ||
    variant === 'h4' ||
    variant === 'h5' ||
    variant === 'h6'
      ? variant
      : 'p')

  return (
    <Tag
      className={`typography ${variant ? `typography--${variant}` : ''} ${color ? `text-${color}` : ''} ${align ? `text-${align}` : ''} ${gutterBottom ? 'mb-md' : ''} ${noWrap ? 'truncate' : ''} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
