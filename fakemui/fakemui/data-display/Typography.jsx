import React from 'react'

export const Typography = ({ children, variant, color, align, gutterBottom, noWrap, className = '', as, ...props }) => {
  const Tag = as || (variant === 'h1' || variant === 'h2' || variant === 'h3' || variant === 'h4' || variant === 'h5' || variant === 'h6' ? variant : 'p')
  return <Tag className={`typography ${variant ? `typography--${variant}` : ''} ${color ? `text-${color}` : ''} ${align ? `text-${align}` : ''} ${gutterBottom ? 'mb-md' : ''} ${noWrap ? 'truncate' : ''} ${className}`} {...props}>{children}</Tag>
}
