'use client'

import { forwardRef, ReactNode, createContext, useContext, useState } from 'react'
import {
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel,
  SelectProps as MuiSelectProps,
  SelectChangeEvent,
  Box,
  Typography,
  Divider,
} from '@mui/material'

// Context to manage select state
interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
}

const SelectContext = createContext<SelectContextType | null>(null)

// Select Root
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

// SelectGroup - wraps items
interface SelectGroupProps {
  children: ReactNode
}

const SelectGroup = ({ children }: SelectGroupProps) => {
  return <>{children}</>
}

// SelectValue - displays selected value
interface SelectValueProps {
  placeholder?: string
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const context = useContext(SelectContext)
  return <>{context?.value || placeholder}</>
}

// SelectTrigger - the clickable element
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
        sx={{
          minHeight: size === 'sm' ? 32 : 40,
        }}
        {...props}
      >
        {/* Items will be rendered by SelectContent */}
      </MuiSelect>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

// SelectContent - wrapper for items
interface SelectContentProps {
  children: ReactNode
  position?: 'item-aligned' | 'popper'
}

const SelectContent = ({ children }: SelectContentProps) => {
  return <>{children}</>
}

// SelectLabel
interface SelectLabelProps {
  children: ReactNode
}

const SelectLabel = ({ children }: SelectLabelProps) => {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ px: 2, py: 1, display: 'block' }}
    >
      {children}
    </Typography>
  )
}

// SelectItem
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

// SelectSeparator
const SelectSeparator = () => {
  return <Divider sx={{ my: 0.5 }} />
}

// Scroll buttons - not needed in MUI, but exported for compatibility
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
