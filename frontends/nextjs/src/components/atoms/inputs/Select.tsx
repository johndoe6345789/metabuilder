'use client'

import { Select as FakemuiSelect } from '@/fakemui'
import { forwardRef } from 'react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

/**
 * Props for the Select component
 * Wrapper around fakemui Select to maintain API compatibility
 */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Array of select options */
  options: SelectOption[]
  /** Placeholder text */
  placeholder?: string
  /** Error state */
  error?: boolean
  /** Full width */
  fullWidth?: boolean
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
  /** MUI displayEmpty prop (ignored for compatibility) */
  displayEmpty?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, error, fullWidth = true, placeholder, sx, className, displayEmpty, ...props }, ref) => {
    // Combine className with any sx-based classes
    const combinedClassName = [className, sx?.className, error ? 'select--error' : ''].filter(Boolean).join(' ')

    return (
      <FakemuiSelect
        ref={ref}
        fullWidth={fullWidth}
        className={combinedClassName}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </FakemuiSelect>
    )
  }
)

Select.displayName = 'Select'

export { Select }
