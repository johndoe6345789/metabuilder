'use client'

import { createContext, forwardRef, ReactNode, useContext, useState } from 'react'

import { Divider, FormControl, MenuItem, Select as FakeMuiSelect, Typography } from '@/fakemui'

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
}

const SelectContext = createContext<SelectContextType | null>(null)

interface SelectProps {
  children: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

const Select = ({ children, value, defaultValue, onValueChange, disabled }: SelectProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const currentValue = value ?? internalValue
  const handleChange = (newValue: string) => {
    if (!value) setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <FormControl className={disabled ? 'form-control--disabled' : ''}>
        {children}
      </FormControl>
    </SelectContext.Provider>
  )
}

interface SelectGroupProps {
  children: ReactNode
}

const SelectGroup = ({ children }: SelectGroupProps) => <>{children}</>

interface SelectValueProps {
  placeholder?: string
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const context = useContext(SelectContext)
  return <>{context?.value || placeholder}</>
}

interface SelectTriggerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'default'
  id?: string
}

const SelectTrigger = forwardRef<HTMLSelectElement, SelectTriggerProps>(
  ({ children, size = 'default', id, className, ...props }, ref) => {
    const context = useContext(SelectContext)

    return (
      <FakeMuiSelect
        ref={ref}
        value={context?.value ?? ''}
        onChange={(e) => context?.onValueChange(e.target.value)}
        sm={size === 'sm'}
        id={id}
        className={className}
        {...props}
      >
        {children}
      </FakeMuiSelect>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

interface SelectContentProps {
  children: ReactNode
  position?: 'item-aligned' | 'popper'
}

const SelectContent = ({ children }: SelectContentProps) => <>{children}</>

interface SelectLabelProps {
  children: ReactNode
}

const SelectLabel = ({ children }: SelectLabelProps) => {
  return (
    <Typography variant="caption" className="select-label">
      {children}
    </Typography>
  )
}

interface SelectItemProps {
  children: ReactNode
  value: string
  disabled?: boolean
}

const SelectItem = forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ children, value, disabled }, ref) => {
    const context = useContext(SelectContext)
    return (
      <MenuItem
        ref={ref}
        onClick={() => !disabled && context?.onValueChange(value)}
        disabled={disabled}
      >
        {children}
      </MenuItem>
    )
  }
)
SelectItem.displayName = 'SelectItem'

const SelectSeparator = () => <Divider className="select-separator" />
const SelectScrollUpButton = () => null
const SelectScrollDownButton = () => null

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
