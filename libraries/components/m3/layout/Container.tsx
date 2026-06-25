import React from 'react'
import { sxToStyle } from '../utils/sx'

export type ContainerMaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  maxWidth?: ContainerMaxWidth
  disableGutters?: boolean
  testId?: string
  sx?: Record<string, unknown>
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth,
  disableGutters,
  className = '',
  testId,
  sx,
  style,
  ...props
}) => (
  <div
    className={`container ${maxWidth ? `container--${maxWidth}` : ''} ${disableGutters ? 'container--no-gutters' : ''} ${className}`}
    style={{ ...sxToStyle(sx), ...style }}
    data-testid={testId}
    {...props}
  >
    {children}
  </div>
)
