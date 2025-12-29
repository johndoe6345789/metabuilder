'use client'

import { FormControlLabel,Switch as MuiSwitch } from '@mui/material'
import { type ComponentProps,forwardRef } from 'react'

type MuiSwitchProps = ComponentProps<typeof MuiSwitch>

/**
 * Props for the Switch component
 * @extends {MuiSwitchProps} Inherits Material-UI Switch props
 */
export interface SwitchProps extends MuiSwitchProps {
  /** Optional label text to display next to the switch */
  label?: string
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(({ label, ...props }, ref) => {
  if (label) {
    return (
      <FormControlLabel
        control={<MuiSwitch ref={ref} {...props} />}
        label={label}
        sx={{
          '& .MuiFormControlLabel-label': {
            fontSize: '0.875rem',
          },
        }}
      />
    )
  }

  return <MuiSwitch ref={ref} {...props} />
})

Switch.displayName = 'Switch'

export { Switch }
