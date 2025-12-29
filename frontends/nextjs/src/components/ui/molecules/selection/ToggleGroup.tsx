'use client'

import { forwardRef, ReactNode } from 'react'
import { ToggleButtonGroup, ToggleButton, ToggleButtonGroupProps } from '@mui/material'

interface ToggleGroupProps {
  children: ReactNode
  type?: 'single' | 'multiple'
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  disabled?: boolean
  className?: string
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      children,
      type = 'single',
      value,
      defaultValue,
      onValueChange,
      disabled,
      variant = 'default',
      size = 'default',
      ...props
    },
    ref
  ) => {
    const handleChange = (_: React.MouseEvent, newValue: string | string[] | null) => {
      if (newValue !== null) {
        onValueChange?.(newValue)
      }
    }

    return (
      <ToggleButtonGroup
        ref={ref}
        exclusive={type === 'single'}
        value={value ?? defaultValue}
        onChange={handleChange}
        disabled={disabled}
        size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium'}
        sx={{
          bgcolor: variant === 'outline' ? 'transparent' : 'action.hover',
          borderRadius: 2,
          border: variant === 'outline' ? 1 : 0,
          borderColor: 'divider',
          '& .MuiToggleButtonGroup-grouped': {
            border: 0,
            borderRadius: 1.5,
            m: 0.5,
            '&.Mui-selected': {
              bgcolor: 'background.paper',
              boxShadow: 1,
            },
          },
        }}
        {...props}
      >
        {children}
      </ToggleButtonGroup>
    )
  }
)
ToggleGroup.displayName = 'ToggleGroup'

interface ToggleGroupItemProps {
  children: ReactNode
  value: string
  disabled?: boolean
  className?: string
}

const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ children, value, disabled, ...props }, ref) => {
    return (
      <ToggleButton
        ref={ref}
        value={value}
        disabled={disabled}
        sx={{
          px: 2,
          py: 1,
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
        }}
        {...props}
      >
        {children}
      </ToggleButton>
    )
  }
)
ToggleGroupItem.displayName = 'ToggleGroupItem'

export { ToggleGroup, ToggleGroupItem }
