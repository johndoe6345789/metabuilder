'use client'

import { InputBase, InputBaseProps } from '@/fakemui/fakemui/inputs'
import { forwardRef, InputHTMLAttributes } from 'react'
import styles from './Input.module.scss'

/**
 * Props for the Input component
 * @extends {InputHTMLAttributes} Inherits HTML input element attributes
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Whether the input is in an error state */
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type, error, className, style, ...props }, ref) => {
    // Filter out HTML-specific props that conflict with InputBase
    const { color, ...restProps } = props as InputProps & { color?: string }
    return (
      <InputBase
        inputRef={ref}
        type={type}
        error={error}
        fullWidth
        className={`${styles.input} ${error ? styles.error : ''} ${className || ''}`}
        inputProps={restProps}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
