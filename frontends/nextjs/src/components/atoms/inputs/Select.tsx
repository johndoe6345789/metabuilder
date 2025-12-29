'use client'

import { forwardRef } from 'react'
import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
  FormControl,
} from '@mui/material'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<MuiSelectProps, 'children'> {
  options: SelectOption[]
  placeholder?: string
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ options, error, fullWidth = true, placeholder, ...props }, ref) => {
    return (
      <FormControl fullWidth={fullWidth} error={error}>
        <MuiSelect
          ref={ref}
          displayEmpty={!!placeholder}
          sx={{
            fontSize: '0.875rem',
            bgcolor: 'background.paper',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? 'error.main' : 'divider',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? 'error.main' : 'text.secondary',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? 'error.main' : 'primary.main',
              borderWidth: 2,
            },
          }}
          {...props}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              {placeholder}
            </MenuItem>
          )}
          {options.map(option => (
            <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    )
  }
)

Select.displayName = 'Select'

export { Select }
