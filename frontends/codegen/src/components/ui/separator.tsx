import React from 'react'

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

export const Separator: React.FC<SeparatorProps> = ({
  className = '',
  orientation: _orientation,
  decorative: _decorative,
  ...props
}) => <div role="separator" className={className} {...props} />
