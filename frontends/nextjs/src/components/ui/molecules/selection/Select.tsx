'use client'

import {
  Divider,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import { createContext, forwardRef, ReactNode, useContext, useState } from 'react'

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
      <FormControl fullWidth disabled={disabled} size="small">
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

const SelectTrigger = forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ children, size = 'default', id, ...props }, ref) => {
    const context = useContext(SelectContext)

    return (
      <MuiSelect
        ref={ref}
        value={context?.value ?? ''}
        onChange={(e: SelectChangeEvent) => context?.onValueChange(e.target.value)}
        size={size === 'sm' ? 'small' : 'medium'}
        displayEmpty
        renderValue={() => children}
        id={id}
        sx={{ minHeight: size === 'sm' ? 32 : 40 }}
        {...props}
      />
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
    <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1, display: 'block' }}>
      {children}
    </Typography>
  )
}

interface SelectItemProps {
  children: ReactNode
  value: string
  disabled?: boolean
}

const SelectItem = forwardRef<HTMLLIElement, SelectItemProps>(
  ({ children, value, disabled }, ref) => {
    return (
      <MenuItem ref={ref} value={value} disabled={disabled}>
        {children}
      </MenuItem>
    )
  }
)
SelectItem.displayName = 'SelectItem'

const SelectSeparator = () => <Divider sx={{ my: 0.5 }} />
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
