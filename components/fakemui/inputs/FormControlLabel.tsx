'use client'

import React, { forwardRef, cloneElement, isValidElement } from 'react'

/**
 * Props for FormControlLabel component (MUI-compatible)
 */
export interface FormControlLabelProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'onChange'> {
  testId?: string
  /** The control element (Checkbox, Radio, Switch) */
  control: React.ReactElement
  /** The label text or element */
  label: React.ReactNode
  /** Whether the control is disabled */
  disabled?: boolean
  /** Whether the label should appear after the control */
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom'
  /** Value for form submission */
  value?: unknown
  /** MUI sx prop for styling compatibility */
  sx?: Record<string, unknown>
}

/**
 * FormControlLabel - A wrapper for form controls with labels (MUI-compatible)
 *
 * @example
 * ```tsx
 * <FormControlLabel
 *   control={<Checkbox checked={checked} onChange={handleChange} />}
 *   label="Remember me"
 * />
 * ```
 */
export const FormControlLabel = forwardRef<HTMLLabelElement, FormControlLabelProps>(
  (
    {
      control,
      label,
      disabled = false,
      labelPlacement = 'end',
      testId,
      className = '',
      sx,
      ...props
    },
    ref
  ) => {
    // Clone the control element to inject disabled prop if needed
    const controlElement = isValidElement(control)
      ? cloneElement(control, {
          ...(control.props as Record<string, unknown>),
          disabled: disabled || (control.props as Record<string, unknown>).disabled,
        } as Partial<typeof control.props>)
      : control

    const renderLabel = () => (
      <span className={`form-control-label__label ${disabled ? 'form-control-label__label--disabled' : ''}`}>
        {label}
      </span>
    )

    return (
      <label
        ref={ref}
        className={`
          form-control-label
          form-control-label--${labelPlacement}
          ${disabled ? 'form-control-label--disabled' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        data-testid={testId}
        {...props}
      >
        {labelPlacement === 'start' || labelPlacement === 'top' ? (
          <>
            {renderLabel()}
            {controlElement}
          </>
        ) : (
          <>
            {controlElement}
            {renderLabel()}
          </>
        )}
      </label>
    )
  }
)

FormControlLabel.displayName = 'FormControlLabel'
