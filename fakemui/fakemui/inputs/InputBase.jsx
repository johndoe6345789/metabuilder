import React, { forwardRef } from 'react'
import { classNames } from '../utils/classNames'

export const ButtonBase = forwardRef(function ButtonBase(
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
      className={classNames('fakemui-button-base', className, {
        'fakemui-button-base-disabled': disabled,
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

export const InputBase = forwardRef(function InputBase(
  {
    className,
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
      ref={inputRef}
      className="fakemui-input-base-input"
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={rows}
      {...inputProps}
    />
  ) : (
    <InputComponent
      ref={inputRef}
      className="fakemui-input-base-input"
      type={type}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      {...inputProps}
    />
  )

  return (
    <div
      ref={ref}
      className={classNames('fakemui-input-base', className, {
        'fakemui-input-base-disabled': disabled,
        'fakemui-input-base-error': error,
        'fakemui-input-base-fullwidth': fullWidth,
        'fakemui-input-base-multiline': multiline,
      })}
      {...props}
    >
      {startAdornment && (
        <span className="fakemui-input-base-adornment-start">{startAdornment}</span>
      )}
      {inputElement}
      {endAdornment && (
        <span className="fakemui-input-base-adornment-end">{endAdornment}</span>
      )}
    </div>
  )
})

export const FilledInput = forwardRef(function FilledInput(props, ref) {
  return (
    <InputBase
      ref={ref}
      {...props}
      className={classNames('fakemui-filled-input', props.className)}
    />
  )
})

export const OutlinedInput = forwardRef(function OutlinedInput(
  { label, notched, ...props },
  ref
) {
  return (
    <InputBase
      ref={ref}
      {...props}
      className={classNames('fakemui-outlined-input', props.className, {
        'fakemui-outlined-input-notched': notched,
      })}
    />
  )
})

export default InputBase
