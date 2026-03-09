import React from 'react'

export interface EditorWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  sm?: boolean
  lg?: boolean
  xl?: boolean
  /** Test ID for automated testing */
  testId?: string
}

export const EditorWrapper: React.FC<EditorWrapperProps> = ({ children, sm, lg, xl, testId, className = '', ...props }) => (
  <div
    className={`editor-wrapper ${sm ? 'editor-wrapper--sm' : ''} ${lg ? 'editor-wrapper--lg' : ''} ${xl ? 'editor-wrapper--xl' : ''} ${className}`}
    data-testid={testId}
    {...props}
  >
    {children}
  </div>
)
