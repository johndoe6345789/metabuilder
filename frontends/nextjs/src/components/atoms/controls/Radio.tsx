'use client'

import { FormControlLabel,Radio as MuiRadio, RadioProps as MuiRadioProps } from '@mui/material'
import { forwardRef } from 'react'

export interface RadioProps extends MuiRadioProps {
  label?: string
}

const Radio = forwardRef<HTMLButtonElement, RadioProps>(({ label, ...props }, ref) => {
  const radioElement = (
    <MuiRadio
      ref={ref}
      sx={{
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      {...props}
    />
  )

  if (label) {
    return <FormControlLabel control={radioElement} label={label} />
  }

  return radioElement
})

Radio.displayName = 'Radio'

export { Radio }
