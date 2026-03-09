import React, { forwardRef, createContext, useContext, Children, cloneElement, isValidElement, useId } from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/mat-radio.module.scss'

/**
 * RadioGroup context value
 */
interface RadioGroupContextValue {
  name?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const RadioGroupContext = createContext<RadioGroupContextValue>({})

/**
 * Hook to access RadioGroup context
 */
export const useRadioGroup = () => useContext(RadioGroupContext)

/**
 * Props for RadioGroup component
 */
export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  testId?: string
  children?: React.ReactNode
  /** Name attribute for all radio buttons */
  name?: string
  /** Currently selected value */
  value?: string
  /** Default value for uncontrolled usage */
  defaultValue?: string
  /** Called when selection changes */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Stack radio buttons horizontally */
  row?: boolean
}

/**
 * RadioGroup - Groups Radio buttons with shared name and selection state
 *
 * Uses Angular Material M3 styling via CSS modules.
 *
 * @example
 * ```tsx
 * <RadioGroup name="size" value={size} onChange={handleChange}>
 *   <Radio value="small" label="Small" />
 *   <Radio value="medium" label="Medium" />
 *   <Radio value="large" label="Large" />
 * </RadioGroup>
 * ```
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      children,
      name: nameProp,
      value,
      defaultValue,
      onChange,
      row = false,
      testId,
      className,
      ...props
    },
    ref
  ) => {
    const generatedName = useId()
    const name = nameProp ?? generatedName

    // Build class list using Angular Material styles
    const groupClasses = classNames(
      styles.radioGroup,
      {
        [styles.radioGroupRow]: row,
      },
      className
    )

    // Enhance child Radio components with group context
    const enhancedChildren = Children.map(children, (child) => {
      if (isValidElement(child)) {
        const childValue = (child.props as Record<string, unknown>).value as string | undefined
        return cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          name,
          checked: value !== undefined ? childValue === value : undefined,
          defaultChecked: defaultValue !== undefined ? childValue === defaultValue : undefined,
          onChange,
        })
      }
      return child
    })

    return (
      <RadioGroupContext.Provider value={{ name, value, onChange }}>
        <div
          ref={ref}
          role="radiogroup"
          className={groupClasses}
          data-testid={testId}
          {...props}
        >
          {enhancedChildren}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'
