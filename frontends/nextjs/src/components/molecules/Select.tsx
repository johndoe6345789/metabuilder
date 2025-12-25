'use client'

import { forwardRef, ReactNode } from 'react'
import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
  MenuItemProps,
  FormControl,
  InputLabel,
  FormHelperText,
  Box,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

// Select wrapper with FormControl
export interface SelectProps extends Omit<MuiSelectProps<string>, 'onChange'> {
  onValueChange?: (value: string) => void
  helperText?: ReactNode
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ onValueChange, value, defaultValue, label, error, helperText, children, sx, variant = 'outlined', ...props }, ref) => {
    return (
      <FormControl ref={ref} fullWidth error={error} sx={sx}>
        {label && <InputLabel>{label}</InputLabel>}
        <MuiSelect<string>
          value={value}
          defaultValue={defaultValue}
          label={label}
          variant={variant}
          onChange={(e) => onValueChange?.(e.target.value as string)}
          IconComponent={KeyboardArrowDownIcon}
          {...props}
        >
          {children}
        </MuiSelect>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    )
  }
)
Select.displayName = 'Select'

// SelectTrigger (shadcn compat - wraps select display)
interface SelectTriggerProps {
  children: ReactNode
  className?: string
}

const SelectTrigger = forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'text.secondary',
          },
        }}
        {...props}
      >
        {children}
        <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
      </Box>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

// SelectValue (placeholder display)
interface SelectValueProps {
  placeholder?: string
  children?: ReactNode
}

const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, children, ...props }, ref) => {
    return (
      <Box component="span" ref={ref} sx={{ color: children ? 'text.primary' : 'text.secondary' }} {...props}>
        {children || placeholder}
      </Box>
    )
  }
)
SelectValue.displayName = 'SelectValue'

// SelectContent (dropdown container - just passes children in MUI)
const SelectContent = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return <>{children}</>
  }
)
SelectContent.displayName = 'SelectContent'

// SelectItem
export interface SelectItemProps extends MenuItemProps {
  textValue?: string
}

const SelectItem = forwardRef<HTMLLIElement, SelectItemProps>(
  ({ value, children, textValue, ...props }, ref) => {
    return (
      <MenuItem ref={ref} value={value} {...props}>
        {children}
      </MenuItem>
    )
  }
)
SelectItem.displayName = 'SelectItem'

// SelectGroup
const SelectGroup = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return <Box ref={ref} {...props}>{children}</Box>
  }
)
SelectGroup.displayName = 'SelectGroup'

// SelectLabel
const SelectLabel = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{ px: 2, py: 1, fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
SelectLabel.displayName = 'SelectLabel'

// SelectSeparator
const SelectSeparator = forwardRef<HTMLHRElement>((props, ref) => {
  return <Box ref={ref} component="hr" sx={{ my: 0.5, borderColor: 'divider' }} {...props} />
})
SelectSeparator.displayName = 'SelectSeparator'

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
}
