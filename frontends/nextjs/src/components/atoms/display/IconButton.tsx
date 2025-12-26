'use client'

import { forwardRef } from 'react'
import { 
  IconButton as MuiIconButton, 
  IconButtonProps as MuiIconButtonProps,
} from '@mui/material'

export type IconButtonSize = 'small' | 'medium' | 'large'

export interface IconButtonProps extends MuiIconButtonProps {
  variant?: 'default' | 'outlined' | 'contained'
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'default', sx, ...props }, ref) => {
    return (
      <MuiIconButton
        ref={ref}
        sx={{
          ...(variant === 'outlined' && {
            border: 1,
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }),
          ...(variant === 'contained' && {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }),
          ...sx,
        }}
        {...props}
      />
    )
  }
)

IconButton.displayName = 'IconButton'

export { IconButton }
