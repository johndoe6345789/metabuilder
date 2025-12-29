'use client'

import {
  Box,
  CircularProgress,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { forwardRef, ReactNode } from 'react'

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
          <ListItemText primary={children} primaryTypographyProps={{ fontSize: '0.875rem' }} />
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

export { CommandItem, CommandLoading, CommandSeparator, CommandShortcut }
