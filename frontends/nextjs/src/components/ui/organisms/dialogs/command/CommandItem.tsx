'use client'

import { forwardRef, ReactNode } from 'react'
import { Box, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'

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

export { CommandItem }
export type { CommandItemProps }
