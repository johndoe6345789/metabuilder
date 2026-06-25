import React from 'react'

export interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
  /** Test ID for automated testing */
  testId?: string
}

/**
 * Separator component (alias for Divider)
 * Used for visual separation between content sections
 */
export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  decorative = true,
  testId,
  className = '',
  ...props
}) => (
  <hr
    className={`separator separator--${orientation} ${className}`}
    data-testid={testId}
    role={decorative ? 'presentation' : 'separator'}
    aria-orientation={orientation}
    {...props}
  />
)

export default Separator
