import React from 'react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | string
}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const Alert: React.FC<AlertProps> = ({ className = '', variant: _variant, ...props }) => (
  <div role="alert" className={className} {...props} />
)

export const AlertTitle: React.FC<AlertTitleProps> = ({ className = '', ...props }) => (
  <h5 className={className} {...props} />
)

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ className = '', ...props }) => (
  <p className={className} {...props} />
)
