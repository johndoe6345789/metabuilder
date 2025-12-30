import React, { forwardRef } from 'react'
import { useFormControl } from './FormControl'

/**
 * Props for NativeSelect component
 */
export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children?: React.ReactNode
  /** Visual variant */
  variant?: 'standard' | 'outlined' | 'filled'
  /** Icon component to use for dropdown indicator */
  IconComponent?: React.ComponentType<{ className?: string }>
  /** Input element props */
  inputProps?: React.SelectHTMLAttributes<HTMLSelectElement>
  /** Full width select */
  fullWidth?: boolean
  /** Error state */
  error?: boolean
}

/**
 * NativeSelect - Native browser select element with MUI-like styling
 * 
 * @example
 * ```tsx
 * <NativeSelect value={value} onChange={handleChange}>
 *   <option value="">Select an option</option>
 *   <option value="one">One</option>
 *   <option value="two">Two</option>
 * </NativeSelect>
 * ```
 */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    { 
      children, 
      variant = 'outlined',
      IconComponent,
      inputProps,
      fullWidth = false,
      error: errorProp,
      disabled: disabledProp,
      className = '', 
      ...props 
    }, 
    ref
  ) => {
    const formControl = useFormControl()
    const error = errorProp ?? formControl.error
    const disabled = disabledProp ?? formControl.disabled

    return (
      <div 
        className={`
          native-select 
          native-select--${variant}
          ${fullWidth ? 'native-select--full-width' : ''} 
          ${error ? 'native-select--error' : ''} 
          ${disabled ? 'native-select--disabled' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
      >
        <select
          ref={ref}
          className="native-select__input"
          disabled={disabled}
          aria-invalid={error}
          {...inputProps}
          {...props}
        >
          {children}
        </select>
        {IconComponent && (
          <IconComponent className="native-select__icon" />
        )}
      </div>
    )
  }
)

NativeSelect.displayName = 'NativeSelect'
