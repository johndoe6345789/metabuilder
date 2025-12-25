'use client'

import { forwardRef } from 'react'
import { 
  Switch as MuiSwitch, 
  SwitchProps as MuiSwitchProps,
  FormControlLabel,
} from '@mui/material'

export interface SwitchProps extends MuiSwitchProps {
  label?: string
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ label, ...props }, ref) => {
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
  }
)

Switch.displayName = 'Switch'

export { Switch }
