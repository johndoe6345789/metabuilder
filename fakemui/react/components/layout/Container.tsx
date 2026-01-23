import React from 'react'

export type ContainerMaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  maxWidth?: ContainerMaxWidth
  disableGutters?: boolean
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth,
  disableGutters,
  className = '',
  ...props
}) => (
  <div
    className={`container ${maxWidth ? `container--${maxWidth}` : ''} ${disableGutters ? 'container--no-gutters' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
)
