'use client'

import { Checkbox as MuiCheckbox, CheckboxProps as MuiCheckboxProps } from '@mui/material'
import { forwardRef } from 'react'

/**
 * Props for the Checkbox component
 * @extends {MuiCheckboxProps} Inherits Material-UI Checkbox props
 */
export interface CheckboxProps extends Omit<MuiCheckboxProps, 'onChange'> {
  /** Callback when checked state changes (alternative to onChange) */
  onCheckedChange?: (checked: boolean) => void
  /** Standard onChange handler */
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
