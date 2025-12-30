import React from 'react'

export const Breadcrumbs = ({ children, separator = '/', className = '', ...props }) => (
  <nav className={`breadcrumbs ${className}`} aria-label="breadcrumb" {...props}>
    <ol className="breadcrumbs-list">
      {React.Children.map(children, (child, i) => (
        <li className="breadcrumbs-item">
          {i > 0 && <span className="breadcrumbs-separator">{separator}</span>}
          {child}
        </li>
      ))}
    </ol>
  </nav>
)
