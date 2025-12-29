'use client'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {
  FormControl,
  FormHelperText,
  InputLabel,
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
} from '@mui/material'
import { forwardRef, ReactNode } from 'react'

import { SelectContent } from './SelectContent'
import { SelectGroup } from './SelectGroup'
import type { SelectItemProps } from './SelectItem'
import { SelectItem } from './SelectItem'
import { SelectLabel } from './SelectLabel'
import { SelectSeparator } from './SelectSeparator'
import { SelectTrigger } from './SelectTrigger'
import { SelectValue } from './SelectValue'

export interface SelectProps extends Omit<MuiSelectProps<string>, 'onChange'> {
  onValueChange?: (value: string) => void
  helperText?: ReactNode
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      onValueChange,
      value,
      defaultValue,
      label,
      error,
      helperText,
      children,
      sx,
      variant = 'outlined',
      ...props
    },
    ref
  ) => {
    return (
      <FormControl ref={ref} fullWidth error={error} sx={sx}>
        {label && <InputLabel>{label}</InputLabel>}
        <MuiSelect<string>
          value={value}
          defaultValue={defaultValue}
          label={label}
          variant={variant}
          onChange={e => onValueChange?.(e.target.value as string)}
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

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
export type { SelectItemProps }
