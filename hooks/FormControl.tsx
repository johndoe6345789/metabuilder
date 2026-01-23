'use client'

import React, { forwardRef, createContext, useContext, useMemo, useId } from 'react'

/**
 * FormControl context for sharing state with child components
 */
interface FormControlContextValue {
  id?: string
  required?: boolean
  disabled?: boolean
  error?: boolean
  filled?: boolean
  focused?: boolean
}

const FormControlContext = createContext<FormControlContextValue>({})

/**
 * Hook to access FormControl context from child components
 */
export const useFormControl = () => useContext(FormControlContext)

/**
 * Props for FormControl component
 */
export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the field has an error */
  error?: boolean
  /** Full width form control */
  fullWidth?: boolean
  /** Margin size */
  margin?: 'none' | 'dense' | 'normal'
  /** Size of the form control */
  size?: 'small' | 'medium'
  /** Visual variant */
  variant?: 'standard' | 'outlined' | 'filled'
  /** Whether the input has value (filled state) */
  filled?: boolean
  /** Whether the input is focused */
  focused?: boolean
  /** MUI sx prop for styling compatibility */
  sx?: Record<string, unknown>
}

/**
 * FormControl - Provides context to form input components for consistent state
 * 
 * @example
 * ```tsx
 * <FormControl required error={hasError}>
 *   <FormLabel>Email</FormLabel>
 *   <Input placeholder="Enter email" />
 *   <FormHelperText>Required field</FormHelperText>
 * </FormControl>
 * ```
 */
export const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  (
    { 
      children, 
      required = false, 
      disabled = false, 
      error = false,
      fullWidth = false,
      margin = 'none',
      size = 'medium',
      variant = 'outlined',
      filled = false,
      focused = false,
      className = '', 
      sx,
      ...props 
    }, 
    ref
  ) => {
    const id = useId()
    
    const contextValue = useMemo(
      () => ({ id, required, disabled, error, filled, focused }),
      [id, required, disabled, error, filled, focused]
    )

    return (
      <FormControlContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={`
            form-control 
            form-control--${variant}
            form-control--${size}
            form-control--margin-${margin}
            ${fullWidth ? 'form-control--full-width' : ''} 
            ${required ? 'form-control--required' : ''} 
            ${disabled ? 'form-control--disabled' : ''} 
            ${error ? 'form-control--error' : ''} 
            ${focused ? 'form-control--focused' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        >
          {children}
        </div>
      </FormControlContext.Provider>
    )
  }
)

FormControl.displayName = 'FormControl'
