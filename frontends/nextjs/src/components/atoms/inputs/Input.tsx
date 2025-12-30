'use client'

import { Input as FakemuiInput } from '@/fakemui'
import { forwardRef } from 'react'
import type { InputProps as FakemuiInputProps } from '@/fakemui/fakemui/inputs/Input'

/**
 * Props for the Input component
 * Wrapper around fakemui Input to maintain API compatibility
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Whether the input is in an error state */
  error?: boolean
  /** Whether the input should take up the full width of its container */
  fullWidth?: boolean
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
  /** MUI inputRef - forwarded as ref */
  inputRef?: React.Ref<HTMLInputElement>
  /** Start adornment element */
  startAdornment?: React.ReactNode
  /** End adornment element */
  endAdornment?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type, error, fullWidth = true, sx, inputRef, startAdornment, endAdornment, className, ...props }, ref) => {
    // Combine className with any sx-based classes
    const combinedClassName = [className, sx?.className].filter(Boolean).join(' ')

    return (
      <FakemuiInput
        ref={inputRef || ref}
        type={type}
        error={error}
        fullWidth={fullWidth}
        startAdornment={startAdornment}
        endAdornment={endAdornment}
        className={combinedClassName}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
