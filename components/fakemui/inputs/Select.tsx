'use client'

import React, { forwardRef, useState, useRef, useEffect, useId } from 'react'

/**
 * Select event type compatible with MUI
 */
export interface SelectChangeEvent<T = string> {
  target: {
    value: T
    name?: string
  }
}

/**
 * Props for Select component (MUI-compatible)
 */
export interface SelectProps<T = string> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Currently selected value(s) */
  value?: T | T[]
  /** Default value for uncontrolled mode */
  defaultValue?: T | T[]
  /** Enable multiple selection */
  multiple?: boolean
  /** Placeholder when no value is selected */
  displayEmpty?: boolean
  /** Custom render function for selected value(s) */
  renderValue?: (value: T | T[]) => React.ReactNode
  /** onChange callback */
  onChange?: (event: SelectChangeEvent<T | T[]>) => void
  /** onBlur callback */
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void
  /** onFocus callback */
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void
  /** Input name for forms */
  name?: string
  /** Whether the select is disabled */
  disabled?: boolean
  /** Whether the select is required */
  required?: boolean
  /** Whether there's an error */
  error?: boolean
  /** Whether the select takes full width */
  fullWidth?: boolean
  /** Size variant */
  size?: 'small' | 'medium'
  /** Visual variant */
  variant?: 'standard' | 'outlined' | 'filled'
  /** Label for the select */
  label?: string
  /** Auto width based on content */
  autoWidth?: boolean
  /** Menu items */
  children?: React.ReactNode
  /** MUI sx prop for styling compatibility */
  sx?: Record<string, unknown>
  /** Native mode - use native HTML select */
  native?: boolean
  /** Menu props */
  MenuProps?: Record<string, unknown>
  /** Icon component to use */
  IconComponent?: React.ComponentType<{ className?: string }>
  /** Input props */
  inputProps?: Record<string, unknown>
}

/**
 * Select - MUI-compatible select dropdown component
 *
 * @example
 * ```tsx
 * <FormControl>
 *   <InputLabel>Age</InputLabel>
 *   <Select value={age} onChange={handleChange} label="Age">
 *     <MenuItem value={10}>Ten</MenuItem>
 *     <MenuItem value={20}>Twenty</MenuItem>
 *   </Select>
 * </FormControl>
 * ```
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      value: valueProp,
      defaultValue,
      multiple = false,
      displayEmpty = false,
      renderValue,
      onChange,
      onBlur,
      onFocus,
      name,
      disabled = false,
      required = false,
      error = false,
      fullWidth = false,
      size = 'medium',
      variant = 'outlined',
      label,
      autoWidth = false,
      children,
      className = '',
      sx,
      native = false,
      MenuProps,
      IconComponent,
      inputProps,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [internalValue, setInternalValue] = useState<unknown>(
      valueProp ?? defaultValue ?? (multiple ? [] : '')
    )
    const containerRef = useRef<HTMLDivElement>(null)
    const id = useId()

    // Use controlled or uncontrolled value
    const value = valueProp !== undefined ? valueProp : internalValue

    // Sync internal state with prop
    useEffect(() => {
      if (valueProp !== undefined) {
        setInternalValue(valueProp)
      }
    }, [valueProp])

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Get display text from children
    const getDisplayValue = () => {
      if (renderValue) {
        return renderValue(value as string | string[])
      }

      if (multiple && Array.isArray(value)) {
        if (value.length === 0) {
          return displayEmpty ? '' : null
        }
        // Find labels for selected values
        const labels: string[] = []
        React.Children.forEach(children, (child) => {
          if (React.isValidElement(child) && child.props.value !== undefined) {
            if (value.includes(child.props.value)) {
              labels.push(String(child.props.children))
            }
          }
        })
        return labels.join(', ')
      }

      // Single value
      if (value === '' || value === undefined || value === null) {
        return displayEmpty ? '' : null
      }

      // Find the label for the selected value
      let displayLabel: React.ReactNode = value
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.props.value === value) {
          displayLabel = child.props.children
        }
      })
      return displayLabel
    }

    const handleSelect = (selectedValue: unknown) => {
      if (disabled) return

      let newValue: unknown
      if (multiple && Array.isArray(value)) {
        const currentArray = value as unknown[]
        if (currentArray.includes(selectedValue)) {
          newValue = currentArray.filter((v) => v !== selectedValue)
        } else {
          newValue = [...currentArray, selectedValue]
        }
      } else {
        newValue = selectedValue
        setIsOpen(false)
      }

      setInternalValue(newValue)
      onChange?.({
        target: {
          value: newValue as string | string[],
          name,
        },
      })
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setIsOpen(!isOpen)
      } else if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const displayValue = getDisplayValue()
    const hasValue = displayValue !== null && displayValue !== ''

    // If native mode, render a native select
    if (native) {
      return (
        <select
          ref={ref as React.Ref<HTMLSelectElement>}
          name={name}
          value={value as string}
          onChange={(e) => {
            const newValue = multiple
              ? Array.from(e.target.selectedOptions, (opt) => opt.value)
              : e.target.value
            setInternalValue(newValue)
            onChange?.({
              target: {
                value: newValue as string | string[],
                name,
              },
            })
          }}
          disabled={disabled}
          required={required}
          multiple={multiple}
          className={`
            select-native
            ${fullWidth ? 'select--full-width' : ''}
            ${error ? 'select--error' : ''}
            ${size === 'small' ? 'select--small' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...inputProps}
        >
          {children}
        </select>
      )
    }

    return (
      <div
        ref={(node) => {
          // Handle both refs
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
          }
        }}
        className={`
          select-container
          select-container--${variant}
          select-container--${size}
          ${fullWidth ? 'select-container--full-width' : ''}
          ${autoWidth ? 'select-container--auto-width' : ''}
          ${disabled ? 'select-container--disabled' : ''}
          ${error ? 'select-container--error' : ''}
          ${isOpen ? 'select-container--open' : ''}
          ${hasValue || displayEmpty ? 'select-container--has-value' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {/* Hidden input for form submission */}
        <input
          type="hidden"
          name={name}
          value={multiple && Array.isArray(value) ? value.join(',') : String(value ?? '')}
        />

        {/* Select trigger */}
        <div
          role="combobox"
          aria-controls={`${id}-menu`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          aria-required={required}
          tabIndex={disabled ? -1 : 0}
          className="select-trigger"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          onFocus={onFocus}
        >
          <span className={`select-display ${!hasValue && !displayEmpty ? 'select-display--placeholder' : ''}`}>
            {displayValue || (displayEmpty ? <em>None</em> : null)}
          </span>
          {IconComponent ? (
            <IconComponent className="select-icon" />
          ) : (
            <svg className="select-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          )}
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            id={`${id}-menu`}
            role="listbox"
            aria-multiselectable={multiple}
            className="select-menu"
          >
            {React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return child

              const isSelected = multiple && Array.isArray(value)
                ? value.includes(child.props.value)
                : value === child.props.value

              return React.cloneElement(child, {
                ...child.props,
                selected: isSelected,
                onClick: (e: React.MouseEvent) => {
                  child.props.onClick?.(e)
                  handleSelect(child.props.value)
                },
              })
            })}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
