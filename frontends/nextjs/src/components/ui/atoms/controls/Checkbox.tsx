'use client'

import { forwardRef } from 'react'

import { Checkbox as FakemuiCheckbox, CheckboxProps as FakemuiCheckboxProps } from '@/fakemui/fakemui/inputs'

import styles from './Checkbox.module.scss'

/**
 * Props for the Checkbox component
 * @extends {FakemuiCheckboxProps} Inherits fakemui Checkbox props
 */
export interface CheckboxProps extends Omit<FakemuiCheckboxProps, 'onChange'> {
  /** Callback when checked state changes (alternative to onChange) */
  onCheckedChange?: (checked: boolean) => void
  /** Standard onChange handler */
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ onCheckedChange, onChange, className, ...props }, ref) => {
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      onChange?.(event)
      onCheckedChange?.(event.target.checked)
    }

    return (
      <FakemuiCheckbox
        ref={ref}
        onChange={handleChange}
        className={`${styles.checkbox} ${className || ''}`}
        {...props}
      />
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
