import React, { forwardRef } from 'react'
import { classNames } from '../utils/classNames'

export interface ButtonBaseProps extends React.HTMLAttributes<HTMLElement> {
  component?: React.ElementType
  children?: React.ReactNode
  disabled?: boolean
  onClick?: React.MouseEventHandler
  onFocus?: React.FocusEventHandler
  onBlur?: React.FocusEventHandler
  tabIndex?: number
  type?: 'button' | 'submit' | 'reset'
}

export const ButtonBase = forwardRef<HTMLElement, ButtonBaseProps>(function ButtonBase(
  {
    component: Component = 'button',
    className,
    disabled = false,
    children,
    onClick,
    onFocus,
    onBlur,
    tabIndex = 0,
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <Component
      ref={ref}
      className={classNames('m3-button-base', className, {
        'm3-button-base-disabled': disabled,
      })}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex={disabled ? -1 : tabIndex}
      type={Component === 'button' ? type : undefined}
      {...props}
    >
      {children}
    </Component>
  )
})

export interface InputBaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'onFocus' | 'onBlur'> {
  testId?: string
  disabled?: boolean
  error?: boolean
  fullWidth?: boolean
  multiline?: boolean
  rows?: number
  minRows?: number
  maxRows?: number
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  inputComponent?: React.ElementType
  inputProps?: React.InputHTMLAttributes<HTMLInputElement> | React.TextareaHTMLAttributes<HTMLTextAreaElement>
  inputRef?: React.Ref<HTMLInputElement | HTMLTextAreaElement>
  value?: string | number
  defaultValue?: string | number
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  placeholder?: string
  readOnly?: boolean
  required?: boolean
  type?: string
}

export const InputBase = forwardRef<HTMLDivElement, InputBaseProps>(function InputBase(
  {
    className,
    testId,
    disabled = false,
    error = false,
    fullWidth = false,
    multiline = false,
    rows,
    minRows,
    maxRows,
    startAdornment,
    endAdornment,
    inputComponent: InputComponent = 'input',
    inputProps = {},
    inputRef,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    placeholder,
    readOnly = false,
    required = false,
    type = 'text',
    ...props
  },
  ref
) {
  const inputElement = multiline ? (
    <textarea
      ref={inputRef as React.Ref<HTMLTextAreaElement>}
      className="m3-input-base-input"
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
      onFocus={onFocus as React.FocusEventHandler<HTMLTextAreaElement>}
      onBlur={onBlur as React.FocusEventHandler<HTMLTextAreaElement>}
      placeholder={placeholder}
      rows={rows}
      {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
    />
  ) : (
    <InputComponent
      ref={inputRef as React.Ref<HTMLInputElement>}
      className="m3-input-base-input"
      type={type}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
      onFocus={onFocus as React.FocusEventHandler<HTMLInputElement>}
      onBlur={onBlur as React.FocusEventHandler<HTMLInputElement>}
      placeholder={placeholder}
      {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
    />
  )

  return (
    <div
      ref={ref}
      className={classNames('m3-input-base', className, {
        'm3-input-base-disabled': disabled,
        'm3-input-base-error': error,
        'm3-input-base-fullwidth': fullWidth,
        'm3-input-base-multiline': multiline,
      })}
      data-testid={testId}
      {...props}
    >
      {startAdornment && (
        <span className="m3-input-base-adornment-start">{startAdornment}</span>
      )}
      {inputElement}
      {endAdornment && (
        <span className="m3-input-base-adornment-end">{endAdornment}</span>
      )}
    </div>
  )
})

export interface FilledInputProps extends InputBaseProps {}

export const FilledInput = forwardRef<HTMLDivElement, FilledInputProps>(function FilledInput(props, ref) {
  return (
    <InputBase
      ref={ref}
      {...props}
      className={classNames('m3-filled-input', props.className)}
    />
  )
})

export interface OutlinedInputProps extends InputBaseProps {
  label?: React.ReactNode
  notched?: boolean
}

export const OutlinedInput = forwardRef<HTMLDivElement, OutlinedInputProps>(function OutlinedInput(
  { label, notched, ...props },
  ref
) {
  return (
    <InputBase
      ref={ref}
      {...props}
      className={classNames('m3-outlined-input', props.className, {
        'm3-outlined-input-notched': notched,
      })}
    />
  )
})

export default InputBase
