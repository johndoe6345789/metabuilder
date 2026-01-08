import React from 'react'

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  secondary?: boolean
  disabled?: boolean
  sm?: boolean
  xs?: boolean
  lg?: boolean
  mono?: boolean
  center?: boolean
  truncate?: boolean
  as?: React.ElementType
}

export const Text: React.FC<TextProps> = ({
  children,
  secondary,
  disabled,
  sm,
  xs,
  lg,
  mono,
  center,
  truncate,
  className = '',
  as: Tag = 'span',
  ...props
}) => (
  <Tag
    className={`${secondary ? 'text-secondary' : ''} ${disabled ? 'text-disabled' : ''} ${sm ? 'text-sm' : ''} ${xs ? 'text-xs' : ''} ${lg ? 'text-lg' : ''} ${mono ? 'font-mono' : ''} ${center ? 'text-center' : ''} ${truncate ? 'truncate' : ''} ${className}`}
    {...props}
  >
    {children}
  </Tag>
)
