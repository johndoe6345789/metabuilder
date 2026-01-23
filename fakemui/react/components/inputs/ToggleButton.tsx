import React, { forwardRef, Children, cloneElement, isValidElement, createContext, useContext } from 'react'

/**
 * Context for managing toggle button group state
 */
interface ToggleButtonGroupContextValue {
  value: string | string[] | null
  exclusive: boolean
  disabled: boolean
  size: 'small' | 'medium' | 'large'
  onChange: (event: React.MouseEvent, value: string) => void
}

const ToggleButtonGroupContext = createContext<ToggleButtonGroupContextValue | null>(null)

/**
 * Hook to access toggle button group context
 */
export const useToggleButtonGroup = () => useContext(ToggleButtonGroupContext)

export interface ToggleButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  children?: React.ReactNode
  /** Whether this button is selected */
  selected?: boolean
  /** Value for this button in a group */
  value?: string
  /** Button size */
  size?: 'small' | 'medium' | 'large'
  /** Full width button */
  fullWidth?: boolean
}

/**
 * ToggleButton - A button that can be toggled on/off
 * Can be used standalone or within a ToggleButtonGroup
 */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ children, selected, value, size = 'medium', fullWidth, disabled, className = '', onClick, ...props }, ref) => {
    const groupContext = useToggleButtonGroup()
    
    // Use context values if in a group
    const isSelected = groupContext 
      ? (Array.isArray(groupContext.value) 
          ? groupContext.value.includes(value || '') 
          : groupContext.value === value)
      : selected
    const buttonSize = groupContext?.size || size
    const isDisabled = groupContext?.disabled || disabled

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (groupContext && value !== undefined) {
        groupContext.onChange(event, value)
      }
      onClick?.(event)
    }

    const classes = [
      'toggle-btn',
      isSelected ? 'toggle-btn--selected' : '',
      `toggle-btn--${buttonSize}`,
      fullWidth ? 'toggle-btn--full-width' : '',
      className,
    ].filter(Boolean).join(' ')

    return (
      <button
        ref={ref}
        type="button"
        role="button"
        aria-pressed={isSelected}
        disabled={isDisabled}
        className={classes}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

ToggleButton.displayName = 'ToggleButton'

export interface ToggleButtonGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  children?: React.ReactNode
  /** Current selected value(s) */
  value?: string | string[] | null
  /** Default value(s) if uncontrolled */
  defaultValue?: string | string[] | null
  /** Called when selection changes */
  onChange?: (event: React.MouseEvent, value: string | string[] | null) => void
  /** Only allow one selection at a time */
  exclusive?: boolean
  /** Disable all buttons */
  disabled?: boolean
  /** Button size for all children */
  size?: 'small' | 'medium' | 'large'
  /** Stack buttons vertically */
  orientation?: 'horizontal' | 'vertical'
  /** Full width group */
  fullWidth?: boolean
  /** Color theme */
  color?: 'primary' | 'secondary' | 'standard'
}

/**
 * ToggleButtonGroup - Groups toggle buttons with shared state management
 * 
 * @example
 * ```tsx
 * <ToggleButtonGroup value={alignment} exclusive onChange={handleChange}>
 *   <ToggleButton value="left">Left</ToggleButton>
 *   <ToggleButton value="center">Center</ToggleButton>
 *   <ToggleButton value="right">Right</ToggleButton>
 * </ToggleButtonGroup>
 * ```
 */
export const ToggleButtonGroup = forwardRef<HTMLDivElement, ToggleButtonGroupProps>(
  (
    {
      children,
      value,
      defaultValue,
      onChange,
      exclusive = false,
      disabled = false,
      size = 'medium',
      orientation = 'horizontal',
      fullWidth = false,
      color = 'standard',
      className = '',
      ...props
    },
    ref
  ) => {
    // Support uncontrolled usage
    const [internalValue, setInternalValue] = React.useState<string | string[] | null>(
      defaultValue ?? (exclusive ? null : [])
    )
    const currentValue = value !== undefined ? value : internalValue

    const handleChange = (event: React.MouseEvent, buttonValue: string) => {
      let newValue: string | string[] | null

      if (exclusive) {
        // Single selection mode - toggle off if clicking same, otherwise select new
        newValue = currentValue === buttonValue ? null : buttonValue
      } else {
        // Multiple selection mode
        const currentArray = Array.isArray(currentValue) ? currentValue : []
        if (currentArray.includes(buttonValue)) {
          newValue = currentArray.filter(v => v !== buttonValue)
        } else {
          newValue = [...currentArray, buttonValue]
        }
      }

      if (value === undefined) {
        setInternalValue(newValue)
      }
      onChange?.(event, newValue)
    }

    const contextValue: ToggleButtonGroupContextValue = {
      value: currentValue,
      exclusive,
      disabled,
      size,
      onChange: handleChange,
    }

    const classes = [
      'toggle-btn-group',
      orientation === 'vertical' ? 'toggle-btn-group--vertical' : '',
      fullWidth ? 'toggle-btn-group--full-width' : '',
      `toggle-btn-group--${color}`,
      className,
    ].filter(Boolean).join(' ')

    return (
      <ToggleButtonGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="group"
          className={classes}
          {...props}
        >
          {children}
        </div>
      </ToggleButtonGroupContext.Provider>
    )
  }
)

ToggleButtonGroup.displayName = 'ToggleButtonGroup'
