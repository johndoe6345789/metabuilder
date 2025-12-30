'use client'

import { forwardRef, LabelHTMLAttributes } from 'react'

import { Label as FakemuiLabel } from '@/fakemui'

/**
 * Props for the Label component
 * Wrapper around fakemui Label to maintain API compatibility
 */
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Whether to display a required indicator (*) */
  required?: boolean
  /** Whether to style the label as an error state */
  error?: boolean
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required, error, sx, className, ...props }, ref) => {
    // Combine className with any sx-based classes
    const combinedClassName = [
      className,
      sx?.className,
      error ? 'label--error' : '',
    ].filter(Boolean).join(' ')

    return (
      <label ref={ref} className={`label ${combinedClassName}`} {...props}>
        {children}
        {required && <span className="label__required"> *</span>}
      </label>
    )
  }
)

Label.displayName = 'Label'

export { Label }
