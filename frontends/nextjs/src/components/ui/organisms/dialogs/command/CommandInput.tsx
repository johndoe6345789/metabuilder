'use client'

import { forwardRef } from 'react'
import { Box, InputBase } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

interface CommandInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  autoFocus?: boolean
}

const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  ({ placeholder = 'Type a command or search...', value, onChange, autoFocus = true, ...props }, ref) => {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <SearchIcon sx={{ color: 'text.secondary', mr: 1.5 }} />
        <InputBase
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          autoFocus={autoFocus}
          fullWidth
          sx={{
            fontSize: '0.875rem',
            '& input': {
              p: 0,
            },
          }}
          {...props}
        />
      </Box>
    )
  }
)

CommandInput.displayName = 'CommandInput'

export { CommandInput }
export type { CommandInputProps }
