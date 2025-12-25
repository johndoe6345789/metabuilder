'use client'

import { forwardRef, ReactNode, useState, useRef, useEffect, KeyboardEvent } from 'react'
import {
  Box,
  Dialog,
  DialogContent,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Paper,
  Kbd,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

// Types
interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  shortcut?: string[]
  onSelect?: () => void
  disabled?: boolean
  keywords?: string[]
}

interface CommandGroup {
  heading?: string
  items: CommandItem[]
}

// Command Dialog
interface CommandProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

const Command = forwardRef<HTMLDivElement, CommandProps>(
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
Command.displayName = 'Command'

// CommandInput
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

// CommandList
interface CommandListProps {
  children: ReactNode
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
        {children}
      </Box>
    )
  }
)
CommandList.displayName = 'CommandList'

// CommandEmpty
interface CommandEmptyProps {
  children?: ReactNode
}

const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ children = 'No results found.', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          py: 6,
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
  heading?: string
  children: ReactNode
}

const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ heading, children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ py: 0.5 }} {...props}>
        {heading && (
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              display: 'block',
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          >
            {heading}
          </Typography>
        )}
        <List disablePadding dense>
          {children}
        </List>
      </Box>
    )
  }
)
CommandGroup.displayName = 'CommandGroup'

// CommandItem
interface CommandItemProps {
  children?: ReactNode
  icon?: ReactNode
  shortcut?: string[]
  onSelect?: () => void
  disabled?: boolean
  selected?: boolean
}

const CommandItem = forwardRef<HTMLLIElement, CommandItemProps>(
  ({ children, icon, shortcut, onSelect, disabled = false, selected = false, ...props }, ref) => {
    return (
      <ListItem ref={ref} disablePadding {...props}>
        <ListItemButton
          onClick={onSelect}
          disabled={disabled}
          selected={selected}
          sx={{
            mx: 1,
            borderRadius: 1,
            py: 1.5,
            '&.Mui-selected': {
              bgcolor: 'action.selected',
            },
          }}
        >
          {icon && (
            <ListItemIcon sx={{ minWidth: 32 }}>
              {icon}
            </ListItemIcon>
          )}
          <ListItemText
            primary={children}
            primaryTypographyProps={{
              variant: 'body2',
            }}
          />
          {shortcut && shortcut.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
              {shortcut.map((key, index) => (
                <Box
                  key={index}
                  component="kbd"
                  sx={{
                    px: 1,
                    py: 0.25,
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    bgcolor: 'action.hover',
                    borderRadius: 0.5,
                    border: 1,
                    borderColor: 'divider',
                    color: 'text.secondary',
                  }}
                >
                  {key}
                </Box>
              ))}
            </Box>
          )}
        </ListItemButton>
      </ListItem>
    )
  }
)
CommandItem.displayName = 'CommandItem'

// CommandSeparator
const CommandSeparator = forwardRef<HTMLHRElement, Record<string, never>>(
  (props, ref) => {
    return <Divider ref={ref} sx={{ my: 1 }} {...props} />
  }
)
CommandSeparator.displayName = 'CommandSeparator'

// CommandShortcut
interface CommandShortcutProps {
  children: ReactNode
}

const CommandShortcut = forwardRef<HTMLSpanElement, CommandShortcutProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="span"
        sx={{
          ml: 'auto',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
          color: 'text.secondary',
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
CommandShortcut.displayName = 'CommandShortcut'

// Hook for command dialog keyboard shortcuts
function useCommandShortcut(key: string, callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === key) {
        event.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [key, callback])
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  useCommandShortcut,
}
export type { CommandItem as CommandItemType, CommandGroup as CommandGroupType }
