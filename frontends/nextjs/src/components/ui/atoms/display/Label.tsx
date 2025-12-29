'use client'

import { FormLabel, FormLabelProps } from '@mui/material'
import { forwardRef, LabelHTMLAttributes, ReactNode } from 'react'

/**
 * Props for the Label component
 * @extends {FormLabelProps} Inherits Material-UI FormLabel props
 */
export interface LabelProps extends FormLabelProps {
  /** ID of the form element this label is associated with */
  htmlFor?: string
  /** Content to display inside the label */
  children?: ReactNode
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(({ children, ...props }, ref) => {
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
})

Label.displayName = 'Label'

export { Label }
