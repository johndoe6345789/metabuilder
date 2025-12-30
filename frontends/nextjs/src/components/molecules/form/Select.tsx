'use client'

import { forwardRef, ReactNode, SelectHTMLAttributes } from 'react'

import { Box, FormControl, FormHelperText, FormLabel, Select as FakeMuiSelect } from '@/fakemui'
import { KeyboardArrowDown } from '@/fakemui/icons'

import styles from './Select.module.scss'
import { SelectContent } from './SelectContent'
import { SelectGroup } from './SelectGroup'
import type { SelectItemProps } from './SelectItem'
import { SelectItem } from './SelectItem'
import { SelectLabel } from './SelectLabel'
import { SelectSeparator } from './SelectSeparator'
import { SelectTrigger } from './SelectTrigger'
import { SelectValue } from './SelectValue'

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  onValueChange?: (value: string) => void
  helperText?: ReactNode
  label?: ReactNode
  error?: boolean
  fullWidth?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      onValueChange,
      value,
      defaultValue,
      label,
      error,
      helperText,
      children,
      className,
      fullWidth = true,
      ...props
    },
    ref
  ) => {
    return (
      <FormControl className={`${styles.selectWrapper} ${fullWidth ? styles.fullWidth : ''} ${className || ''}`}>
        {label && <FormLabel>{label}</FormLabel>}
        <Box className={styles.selectContainer}>
          <FakeMuiSelect
            ref={ref}
            value={value as string}
            defaultValue={defaultValue as string}
            onChange={e => onValueChange?.(e.target.value)}
            error={error}
            className={styles.select}
            {...props}
          >
            {children}
          </FakeMuiSelect>
          <KeyboardArrowDown size={16} className={styles.icon} />
        </Box>
        {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
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
