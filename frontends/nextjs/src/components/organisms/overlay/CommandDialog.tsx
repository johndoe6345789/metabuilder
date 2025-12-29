'use client'

import SearchIcon from '@mui/icons-material/Search'
import { Box, InputAdornment, TextField } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

// CommandDialog
interface CommandDialogProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const CommandDialog = ({ children, open, onOpenChange }: CommandDialogProps) => {
  if (!open) return null
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: '20vh',
        bgcolor: 'rgba(0,0,0,0.5)',
      }}
      onClick={() => onOpenChange?.(false)}
    >
      <Box onClick={e => e.stopPropagation()} sx={{ width: '100%', maxWidth: 520 }}>
        {children}
      </Box>
    </Box>
  )
}
CommandDialog.displayName = 'CommandDialog'

// CommandInput
interface CommandInputProps {
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  ({ placeholder = 'Search...', value, onValueChange, ...props }, ref) => {
    return (
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          inputRef={ref}
          fullWidth
          size="small"
          placeholder={placeholder}
          value={value}
          onChange={e => onValueChange?.(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
          {...props}
        />
      </Box>
    )
  }
)
CommandInput.displayName = 'CommandInput'

export { CommandDialog, CommandInput }
