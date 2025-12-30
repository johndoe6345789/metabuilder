import React from 'react'

export const Grid = ({ children, container, item, xs, sm, md, lg, xl, spacing, direction, alignItems, justifyContent, className = '', ...props }) => (
  <div className={`${container ? 'grid-container' : ''} ${item ? 'grid-item' : ''} ${spacing ? `gap-${spacing}` : ''} ${direction ? `flex-${direction}` : ''} ${alignItems ? `items-${alignItems}` : ''} ${justifyContent ? `justify-${justifyContent}` : ''} ${xs ? `col-${xs}` : ''} ${sm ? `col-sm-${sm}` : ''} ${md ? `col-md-${md}` : ''} ${lg ? `col-lg-${lg}` : ''} ${className}`} {...props}>{children}</div>
)
