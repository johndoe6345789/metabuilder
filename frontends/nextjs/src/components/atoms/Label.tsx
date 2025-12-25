'use client'

import { forwardRef, LabelHTMLAttributes } from 'react'
import { Typography, TypographyProps } from '@mui/material'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  error?: boolean
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required, error, ...props }, ref) => {
    return (
      <Typography
        component="label"
        ref={ref}
        variant="body2"
        fontWeight={500}
        sx={{
          display: 'inline-block',
          mb: 0.5,
          color: error ? 'error.main' : 'text.primary',
          '&.Mui-disabled': {
            opacity: 0.5,
          },
        }}
        {...props}
      >
        {children}
        {required && (
          <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
            *
          </Typography>
        )}
      </Typography>
    )
  }
)

Label.displayName = 'Label'

export { Label }
