'use client'

import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup as MuiRadioGroup,
} from '@mui/material'
import { forwardRef, ReactNode } from 'react'

interface RadioGroupProps {
  children: ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ children, defaultValue, value, onValueChange, disabled, ...props }, ref) => {
    return (
      <MuiRadioGroup
        ref={ref}
        defaultValue={defaultValue}
        value={value}
        onChange={e => onValueChange?.(e.target.value)}
        sx={{ gap: 1 }}
        {...props}
      >
        {children}
      </MuiRadioGroup>
    )
  }
)
RadioGroup.displayName = 'RadioGroup'

interface RadioGroupItemProps {
  value: string
  disabled?: boolean
  className?: string
  id?: string
}

const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ value, disabled, id, ...props }, ref) => {
    return (
      <Radio
        ref={ref}
        value={value}
        disabled={disabled}
        id={id}
        size="small"
        sx={{
          p: 0,
          width: 16,
          height: 16,
          '& .MuiSvgIcon-root': {
            fontSize: 16,
          },
        }}
        {...props}
      />
    )
  }
)
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }
