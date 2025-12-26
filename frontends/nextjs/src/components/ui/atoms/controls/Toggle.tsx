'use client'

import { forwardRef } from 'react'
import { IconButton, IconButtonProps } from '@mui/material'
import { ToggleButton as MuiToggleButton, ToggleButtonProps as MuiToggleButtonProps } from '@mui/material'

export type ToggleVariant = 'default' | 'outline'
export type ToggleSize = 'default' | 'sm' | 'lg'

export interface ToggleProps extends Omit<MuiToggleButtonProps, 'size'> {
  variant?: ToggleVariant
  size?: ToggleSize
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const sizeMap: Record<ToggleSize, { size: 'small' | 'medium' | 'large'; sx?: object }> = {
  sm: { size: 'small', sx: { height: 32, minWidth: 32 } },
  default: { size: 'medium', sx: { height: 40, minWidth: 40 } },
  lg: { size: 'large', sx: { height: 48, minWidth: 48 } },
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ variant = 'default', size = 'default', pressed, onPressedChange, sx, value, ...props }, ref) => {
    const sizeConfig = sizeMap[size]

    return (
      <MuiToggleButton
        ref={ref}
        value={value || 'toggle'}
        selected={pressed}
        onChange={() => onPressedChange?.(!pressed)}
        size={sizeConfig.size}
        sx={{
          border: variant === 'outline' ? 1 : 0,
          borderColor: 'divider',
          bgcolor: pressed ? 'action.selected' : 'transparent',
          '&:hover': {
            bgcolor: 'action.hover',
          },
          ...sizeConfig.sx,
          ...sx,
        }}
        {...props}
      />
    )
  }
)

Toggle.displayName = 'Toggle'

export { Toggle }
