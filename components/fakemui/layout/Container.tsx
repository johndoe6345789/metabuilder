import React from 'react'

export type ContainerMaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  maxWidth?: ContainerMaxWidth
  disableGutters?: boolean
  testId?: string
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth,
  disableGutters,
  className = '',
  testId,
  ...props
}) => (
  <div
    className={`container ${maxWidth ? `container--${maxWidth}` : ''} ${disableGutters ? 'container--no-gutters' : ''} ${className}`}
    data-testid={testId}
    {...props}
  >
    {children}
  </div>
)
