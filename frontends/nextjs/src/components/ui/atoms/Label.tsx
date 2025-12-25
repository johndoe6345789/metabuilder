'use client'

import { forwardRef, LabelHTMLAttributes, ReactNode } from 'react'
import { FormLabel, FormLabelProps } from '@mui/material'

export interface LabelProps extends FormLabelProps {
  htmlFor?: string
  children?: ReactNode
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, ...props }, ref) => {
    return (
      <FormLabel
        ref={ref}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'text.primary',
          '&.Mui-disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        }}
        {...props}
      >
        {children}
      </FormLabel>
    )
  }
)

Label.displayName = 'Label'

export { Label }
