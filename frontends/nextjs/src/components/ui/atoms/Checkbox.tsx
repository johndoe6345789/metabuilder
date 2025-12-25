'use client'

import { forwardRef } from 'react'
import { Checkbox as MuiCheckbox, CheckboxProps as MuiCheckboxProps } from '@mui/material'

export interface CheckboxProps extends Omit<MuiCheckboxProps, 'onChange'> {
  onCheckedChange?: (checked: boolean) => void
  onChange?: MuiCheckboxProps['onChange']
}

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ onCheckedChange, onChange, ...props }, ref) => {
    const handleChange: MuiCheckboxProps['onChange'] = (event, checked) => {
      onChange?.(event, checked)
      onCheckedChange?.(checked)
    }

    return (
      <MuiCheckbox
        ref={ref}
        onChange={handleChange}
        sx={{
          p: 0,
          width: 18,
          height: 18,
          '& .MuiSvgIcon-root': {
            fontSize: 18,
          },
        }}
        {...props}
      />
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
