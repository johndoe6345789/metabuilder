'use client'

import { forwardRef, ReactNode, useState, useCallback, useMemo } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

// Command container (like cmdk)
export interface CommandProps {
  children: ReactNode
  className?: string
  onValueChange?: (value: string) => void
  value?: string
  filter?: (value: string, search: string) => number
  shouldFilter?: boolean
}

const Command = forwardRef<HTMLDivElement, CommandProps>(
  ({ children, onValueChange, value, shouldFilter = true, ...props }, ref) => {
    return (
      <Paper
        ref={ref}
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
        }}
        {...props}
      >
        {children}
      </Paper>
    )
  }
)
Command.displayName = 'Command'

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
      <Box onClick={(e) => e.stopPropagation()} sx={{ width: '100%', maxWidth: 520 }}>
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
          onChange={(e) => onValueChange?.(e.target.value)}
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

// CommandList
interface CommandListProps {
  children: ReactNode
  className?: string
}

const CommandList = forwardRef<HTMLDivElement, CommandListProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          maxHeight: 300,
          overflow: 'auto',
          py: 1,
        }}
        {...props}
      >
        <List dense disablePadding>
          {children}
        </List>
      </Box>
    )
  }
)
CommandList.displayName = 'CommandList'

// CommandEmpty
interface CommandEmptyProps {
  children?: ReactNode
  className?: string
}

const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ children = 'No results found.', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          py: 4,
          textAlign: 'center',
          color: 'text.secondary',
          fontSize: '0.875rem',
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
CommandEmpty.displayName = 'CommandEmpty'

// CommandGroup
interface CommandGroupProps {
  children: ReactNode
  heading?: string
  className?: string
}

const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ children, heading, ...props }, ref) => {
    return (
      <Box ref={ref} {...props}>
        {heading && (
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ px: 2, py: 1, display: 'block' }}
          >
            {heading}
          </Typography>
        )}
        {children}
      </Box>
    )
  }
)
CommandGroup.displayName = 'CommandGroup'

// CommandItem
interface CommandItemProps {
  children: ReactNode
  value?: string
  onSelect?: (value: string) => void
  disabled?: boolean
  icon?: ReactNode
  shortcut?: string
  className?: string
}

const CommandItem = forwardRef<HTMLLIElement, CommandItemProps>(
  ({ children, value, onSelect, disabled, icon, shortcut, ...props }, ref) => {
    return (
      <ListItem ref={ref} disablePadding {...props}>
        <ListItemButton
          disabled={disabled}
          onClick={() => onSelect?.(value || '')}
          sx={{
            py: 1,
            px: 2,
            borderRadius: 0,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {icon && <ListItemIcon sx={{ minWidth: 32 }}>{icon}</ListItemIcon>}
          <ListItemText
            primary={children}
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
          {shortcut && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              {shortcut}
            </Typography>
          )}
        </ListItemButton>
      </ListItem>
    )
  }
)
CommandItem.displayName = 'CommandItem'

// CommandSeparator
const CommandSeparator = forwardRef<HTMLHRElement>((props, ref) => {
  return <Divider ref={ref} sx={{ my: 1 }} {...props} />
})
CommandSeparator.displayName = 'CommandSeparator'

// CommandShortcut
const CommandShortcut = ({ children }: { children: ReactNode }) => {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        ml: 'auto',
        px: 0.5,
        py: 0.25,
        borderRadius: 0.5,
        bgcolor: 'action.hover',
        fontFamily: 'monospace',
        fontSize: '0.7rem',
      }}
    >
      {children}
    </Typography>
  )
}
CommandShortcut.displayName = 'CommandShortcut'

// CommandLoading
const CommandLoading = ({ children }: { children?: ReactNode }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, gap: 1 }}>
      <CircularProgress size={16} />
      <Typography variant="body2" color="text.secondary">
        {children || 'Loading...'}
      </Typography>
    </Box>
  )
}
CommandLoading.displayName = 'CommandLoading'

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  CommandLoading,
}
