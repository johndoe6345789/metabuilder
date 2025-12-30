'use client'

import { forwardRef, ReactNode } from 'react'

import { Radio, RadioGroup as FakeMuiRadioGroup } from '@/fakemui'

interface RadioGroupProps {
  children: ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ children, defaultValue, value, onValueChange, disabled, className, ...props }, ref) => {
    return (
      <FakeMuiRadioGroup
        ref={ref}
        defaultValue={defaultValue}
        value={value}
        onChange={e => onValueChange?.(e.target.value)}
        className={`radio-group ${disabled ? 'radio-group--disabled' : ''} ${className || ''}`}
        {...props}
      >
        {children}
      </FakeMuiRadioGroup>
    )
  }
)
RadioGroup.displayName = 'RadioGroup'

interface RadioGroupItemProps {
  value: string
  disabled?: boolean
  className?: string
  id?: string
}

const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, disabled, id, className, ...props }, ref) => {
    return (
      <Radio
        ref={ref}
        value={value}
        disabled={disabled}
        id={id}
        className={`radio-item ${className || ''}`}
        {...props}
      />
    )
  }
)
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }
