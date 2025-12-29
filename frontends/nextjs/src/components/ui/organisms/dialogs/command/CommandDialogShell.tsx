'use client'

import { forwardRef } from 'react'
import { Box, Dialog, InputBase } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

import type { CommandDialogProps, CommandInputProps } from './command.types'

const CommandDialogRoot = forwardRef<HTMLDivElement, CommandDialogProps>(
  ({ open, onClose, children, ...props }, ref) => {
    return (
      <Dialog
        ref={ref}
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            position: 'fixed',
            top: '20%',
            m: 0,
            borderRadius: 2,
            maxHeight: '60vh',
            overflow: 'hidden',
          },
        }}
        {...props}
      >
        {children}
      </Dialog>
    )
  }
)
CommandDialogRoot.displayName = 'CommandDialogRoot'

const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  (
    { placeholder = 'Type a command or search...', value, onChange, autoFocus = true, ...props },
    ref
  ) => {
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
          onChange={e => onChange?.(e.target.value)}
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

export { CommandDialogRoot, CommandInput }
