import React from 'react'

export const EditorWrapper = ({ children, sm, lg, xl, className = '', ...props }) => (
  <div className={`editor-wrapper ${sm ? 'editor-wrapper--sm' : ''} ${lg ? 'editor-wrapper--lg' : ''} ${xl ? 'editor-wrapper--xl' : ''} ${className}`} {...props}>{children}</div>
)
