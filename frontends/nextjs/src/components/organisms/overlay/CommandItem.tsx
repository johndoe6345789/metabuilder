'use client'

import { forwardRef, ReactNode } from 'react'

import {
  Box,
  CircularProgress,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@/fakemui'

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
  ({ children, value, onSelect, disabled, icon, shortcut, className, ...props }, ref) => {
    return (
      <ListItem ref={ref} disablePadding className={className} {...props}>
        <ListItemButton
          disabled={disabled}
          onClick={() => onSelect?.(value || '')}
          className="command-item-button"
        >
          {icon && <ListItemIcon className="command-item-icon">{icon}</ListItemIcon>}
          <ListItemText primary={children} />
          {shortcut && (
            <Typography variant="caption" className="command-item-shortcut">
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
const CommandSeparator = forwardRef<HTMLHRElement, { className?: string }>((props, ref) => {
  return <Divider ref={ref} className="command-separator" {...props} />
})
CommandSeparator.displayName = 'CommandSeparator'

// CommandShortcut
const CommandShortcut = ({ children }: { children: ReactNode }) => {
  return (
    <Typography variant="caption" className="command-shortcut">
      {children}
    </Typography>
  )
}
CommandShortcut.displayName = 'CommandShortcut'

// CommandLoading
const CommandLoading = ({ children }: { children?: ReactNode }) => {
  return (
    <Box className="command-loading">
      <CircularProgress size={16} />
      <Typography variant="body2">
        {children || 'Loading...'}
      </Typography>
    </Box>
  )
}
CommandLoading.displayName = 'CommandLoading'

export { CommandItem, CommandLoading, CommandSeparator, CommandShortcut }
