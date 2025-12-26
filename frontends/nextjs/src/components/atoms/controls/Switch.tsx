'use client'

import { forwardRef, type ComponentProps } from 'react'
import { 
  Switch as MuiSwitch, 
  FormControlLabel,
} from '@mui/material'

type MuiSwitchProps = ComponentProps<typeof MuiSwitch>

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
