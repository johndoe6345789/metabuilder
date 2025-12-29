'use client'

import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { forwardRef } from 'react'

import type {
  CommandEmptyProps,
  CommandGroupProps,
  CommandItemProps,
  CommandListProps,
  CommandShortcutProps,
} from './command.types'

const CommandList = forwardRef<HTMLDivElement, CommandListProps>(({ children, ...props }, ref) => {
  return (
    <Box ref={ref} sx={{ maxHeight: 300, overflow: 'auto', py: 1 }} {...props}>
      {children}
    </Box>
  )
})
CommandList.displayName = 'CommandList'

const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ children = 'No results found.', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{ py: 6, textAlign: 'center', color: 'text.secondary', fontSize: '0.875rem' }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
CommandEmpty.displayName = 'CommandEmpty'

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

const CommandItem = forwardRef<HTMLLIElement, CommandItemProps>(
  ({ children, icon, shortcut, onSelect, disabled = false, selected = false, ...props }, ref) => {
    return (
      <ListItem ref={ref} disablePadding {...props}>
        <ListItemButton
          onClick={onSelect}
          disabled={disabled}
          selected={selected}
          sx={{ mx: 1, borderRadius: 1, py: 1.5, '&.Mui-selected': { bgcolor: 'action.selected' } }}
        >
          {icon && <ListItemIcon sx={{ minWidth: 32 }}>{icon}</ListItemIcon>}
          <ListItemText primary={children} primaryTypographyProps={{ variant: 'body2' }} />
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

const CommandSeparator = forwardRef<HTMLHRElement, Record<string, never>>((props, ref) => {
  return <Divider ref={ref} sx={{ my: 1 }} {...props} />
})
CommandSeparator.displayName = 'CommandSeparator'

const CommandShortcut = forwardRef<HTMLSpanElement, CommandShortcutProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="span"
        sx={{ ml: 'auto', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'text.secondary' }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
CommandShortcut.displayName = 'CommandShortcut'

export { CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator, CommandShortcut }
