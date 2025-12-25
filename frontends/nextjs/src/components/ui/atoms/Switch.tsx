'use client'

import { forwardRef } from 'react'
import { Switch as MuiSwitch, SwitchProps as MuiSwitchProps } from '@mui/material'

export interface SwitchProps extends Omit<MuiSwitchProps, 'onChange'> {
  onCheckedChange?: (checked: boolean) => void
  onChange?: MuiSwitchProps['onChange']
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ onCheckedChange, onChange, ...props }, ref) => {
    const handleChange: MuiSwitchProps['onChange'] = (event, checked) => {
      onChange?.(event, checked)
      onCheckedChange?.(checked)
    }

    return (
      <MuiSwitch
        ref={ref}
        onChange={handleChange}
        size="small"
        {...props}
      />
    )
  }
)

Switch.displayName = 'Switch'

export { Switch }
