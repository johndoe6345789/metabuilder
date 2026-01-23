import React from 'react'

export interface EditorWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  sm?: boolean
  lg?: boolean
  xl?: boolean
}

export const EditorWrapper: React.FC<EditorWrapperProps> = ({ children, sm, lg, xl, className = '', ...props }) => (
  <div
    className={`editor-wrapper ${sm ? 'editor-wrapper--sm' : ''} ${lg ? 'editor-wrapper--lg' : ''} ${xl ? 'editor-wrapper--xl' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
)
