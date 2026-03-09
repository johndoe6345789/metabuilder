'use client'

import React, { forwardRef, useState, useRef, useEffect, useId } from 'react'
import styles from '../../../scss/atoms/mat-select.module.scss'

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
export interface SelectProps<T = string> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
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
  /** Test ID for testing frameworks */
  testId?: string
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
      testId,
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
          if (React.isValidElement(child)) {
            const props = child.props as Record<string, unknown>
            if (props.value !== undefined && (value as unknown[]).includes(props.value)) {
              labels.push(String(props.children))
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
      let displayLabel: React.ReactNode = value as React.ReactNode
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          const props = child.props as Record<string, unknown>
          if (props.value === value) {
            displayLabel = props.children as React.ReactNode
          }
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
      } else if (isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault()
        const panel = containerRef.current?.querySelector('[role="listbox"]')
        if (!panel) return
        const items = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), [role="option"]:not([aria-disabled="true"])'))
        const focused = document.activeElement as HTMLElement
        const currentIndex = items.indexOf(focused)
        const nextIndex = event.key === 'ArrowDown'
          ? (currentIndex + 1) % items.length
          : (currentIndex - 1 + items.length) % items.length
        items[nextIndex]?.focus()
      } else if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault()
        setIsOpen(true)
      }
    }

    // Focus first or selected item when dropdown opens
    useEffect(() => {
      if (!isOpen) return
      requestAnimationFrame(() => {
        const panel = containerRef.current?.querySelector('[role="listbox"]')
        if (!panel) return
        const selected = panel.querySelector<HTMLElement>('[class*="highlighted"]')
        const first = panel.querySelector<HTMLElement>('button')
        ;(selected || first)?.focus()
      })
    }, [isOpen])

    const displayValue = getDisplayValue()
    const hasValue = displayValue !== null && displayValue !== ''

    // If native mode, render a native select
    if (native) {
      return (
        <select
          ref={ref as unknown as React.Ref<HTMLSelectElement>}
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
          className={[
            styles.native,
            fullWidth ? styles.fullWidth : '',
            error ? styles.error : '',
            size === 'small' ? styles.small : '',
            className
          ].filter(Boolean).join(' ')}
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
        className={[
          styles.matSelect,
          variant === 'outlined' ? styles.outlined : '',
          variant === 'filled' ? styles.filled : '',
          variant === 'standard' ? styles.standard : '',
          size === 'small' ? styles.small : styles.medium,
          fullWidth ? styles.fullWidth : '',
          autoWidth ? styles.autoWidth : '',
          disabled ? styles.disabled : '',
          error ? styles.error : '',
          isOpen ? styles.open : '',
          hasValue || displayEmpty ? styles.hasValue : '',
          className
        ].filter(Boolean).join(' ')}
        {...props}
        {...(testId ? { 'data-testid': testId } : {})}
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
          {...(label ? { 'aria-label': label } : {})}
          tabIndex={disabled ? -1 : 0}
          className={styles.trigger}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          onFocus={onFocus}
        >
          <span className={!hasValue && !displayEmpty ? styles.placeholder : styles.valueText}>
            <span className={styles.minLine}>
              {displayValue || (displayEmpty ? <em>None</em> : null)}
            </span>
          </span>
          <span className={styles.arrowWrapper}>
            {IconComponent ? (
              <IconComponent className={styles.arrow} />
            ) : (
              <span className={styles.arrow}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </span>
            )}
          </span>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className={styles.menuWrapper}>
            <div
              id={`${id}-menu`}
              role="listbox"
              aria-multiselectable={multiple}
              className={styles.panel}
            >
              {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return child

                const childProps = child.props as Record<string, unknown>
                const isSelected = multiple && Array.isArray(value)
                  ? (value as unknown[]).includes(childProps.value)
                  : value === childProps.value

                return React.cloneElement(child, {
                  ...childProps,
                  selected: isSelected,
                  onClick: (e: React.MouseEvent) => {
                    (childProps.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e)
                    handleSelect(childProps.value)
                  },
                } as Partial<typeof child.props>)
              })}
            </div>
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
