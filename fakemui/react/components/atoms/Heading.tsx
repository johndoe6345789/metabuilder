import React from 'react'

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
  text?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

/**
 * Heading component for section titles
 * Maps to Typography variant="h1-h6" or can be used standalone
 */
export const Heading: React.FC<HeadingProps> = ({
  children,
  text,
  level = 2,
  variant,
  className = '',
  ...props
}) => {
  const headingLevel = variant ? parseInt(variant.slice(1)) : level
  const Tag = `h${headingLevel}` as React.ElementType
  
  return (
    <Tag className={`heading heading--level-${headingLevel} ${className}`} {...props}>
      {text || children}
    </Tag>
  )
}
