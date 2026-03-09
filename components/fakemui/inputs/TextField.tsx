import React, { forwardRef, useId } from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/form.module.scss'
import { FormLabel } from './FormLabel'
import { FormHelperText } from './FormHelperText'
import { Input, InputProps } from './Input'
import { Select } from './Select'
import { useAccessible } from '../../../hooks/useAccessible'
import { sxToStyle } from '../utils/sx'

export interface TextFieldProps extends Omit<InputProps, 'size' | 'label' | 'helperText'> {
  label?: React.ReactNode
  helperText?: React.ReactNode
  error?: boolean
  /** Render as a select dropdown instead of input */
  select?: boolean
  /** Children (for select mode - MenuItem components) */
  children?: React.ReactNode
  /** Input size */
  size?: 'small' | 'medium'
  /** Unique identifier for testing and accessibility */
  testId?: string
  /** MUI sx prop for styling */
  sx?: Record<string, unknown>
}

export const TextField = forwardRef<HTMLInputElement | HTMLDivElement, TextFieldProps>(
  ({ label, helperText, error, className = '', id: providedId, select, children, size, testId: customTestId, sx, style, ...props }, ref) => {
    const generatedId = useId()
    const id = providedId ?? generatedId
    const helperTextId = `${id}-helper-text`

    // Convert size prop to Input's expected format
    const inputSize = size === 'small' ? 'sm' : size === 'medium' ? 'md' : undefined

    const accessible = useAccessible({
      feature: 'form',
      component: select ? 'select' : 'input',
      identifier: customTestId || String(label)?.substring(0, 20),
      ariaDescribedBy: helperText ? helperTextId : undefined,
    })

    const wrapperClasses = classNames(
      styles.formGroup,
      className
    )

    const selectClasses = classNames(styles.inputFullWidth)

    return (
      <div className={wrapperClasses} style={{ ...sxToStyle(sx), ...style }}>
        {label && <FormLabel htmlFor={id}>{label}</FormLabel>}
        {select ? (
          <Select
            ref={ref as React.Ref<HTMLDivElement>}
            id={id}
            error={error}
            className={selectClasses}
            data-testid={accessible['data-testid']}
            aria-invalid={error}
            aria-describedby={helperText ? helperTextId : undefined}
            value={props.value as string | string[] | undefined}
            onChange={props.onChange as unknown as ((event: { target: { value: string | string[]; name?: string } }) => void) | undefined}
            name={props.name}
            disabled={props.disabled}
            required={props.required}
          >
            {children}
          </Select>
        ) : (
          <Input
            ref={ref as React.Ref<HTMLInputElement>}
            id={id}
            error={error}
            size={inputSize}
            data-testid={accessible['data-testid']}
            aria-invalid={error}
            aria-describedby={helperText ? helperTextId : undefined}
            {...props}
          />
        )}
        {helperText && (
          <FormHelperText error={error} id={helperTextId} role="status">
            {helperText}
          </FormHelperText>
        )}
      </div>
    )
  }
)

TextField.displayName = 'TextField'
