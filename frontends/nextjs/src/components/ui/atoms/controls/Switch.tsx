'use client'

import { forwardRef } from 'react'
import { Switch as MuiSwitch, SwitchProps as MuiSwitchProps } from '@mui/material'

/**
 * Props for the Switch component
 * @extends {MuiSwitchProps} Inherits Material-UI Switch props
 */
export interface SwitchProps extends Omit<MuiSwitchProps, 'onChange'> {
  /** Callback when checked state changes (alternative to onChange) */
  onCheckedChange?: (checked: boolean) => void
  /** Standard onChange handler */
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
