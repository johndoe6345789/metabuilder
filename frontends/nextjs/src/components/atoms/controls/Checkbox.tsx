'use client'

import { forwardRef } from 'react'
import { 
  Checkbox as MuiCheckbox, 
  CheckboxProps as MuiCheckboxProps,
  FormControlLabel,
} from '@mui/material'

export interface CheckboxProps extends MuiCheckboxProps {
  label?: string
}

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ label, ...props }, ref) => {
    if (label) {
      return (
        <FormControlLabel
          control={<MuiCheckbox ref={ref} {...props} />}
          label={label}
          sx={{
            '& .MuiFormControlLabel-label': {
              fontSize: '0.875rem',
            },
          }}
        />
      )
    }
    
    return <MuiCheckbox ref={ref} {...props} />
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
