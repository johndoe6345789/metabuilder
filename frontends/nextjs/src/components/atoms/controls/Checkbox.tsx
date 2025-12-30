'use client'

import { Checkbox as FakemuiCheckbox } from '@/fakemui'
import { forwardRef } from 'react'

/**
 * Props for the Checkbox component
 * Wrapper around fakemui Checkbox to maintain API compatibility
 */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Optional label text to display next to the checkbox */
  label?: React.ReactNode
  /** Whether the checkbox is in an error state (MUI compatibility) */
  error?: boolean
  /** MUI color prop (ignored for compatibility) */
  color?: string
  /** MUI size prop (ignored for compatibility) */
  size?: string
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, error, color, size, sx, className, ...props }, ref) => {
  // Combine className with any sx-based classes
  const combinedClassName = [className, sx?.className, error ? 'checkbox--error' : ''].filter(Boolean).join(' ')

  return (
    <FakemuiCheckbox
      ref={ref}
      label={label}
      className={combinedClassName}
      {...props}
    />
  )
})

Checkbox.displayName = 'Checkbox'

export { Checkbox }
