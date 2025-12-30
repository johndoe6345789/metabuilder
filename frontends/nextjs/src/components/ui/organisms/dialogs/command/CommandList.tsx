'use client'

import { forwardRef } from 'react'

import { Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@/fakemui/fakemui/data-display'
import { Box } from '@/fakemui/fakemui/layout'

import type {
  CommandEmptyProps,
  CommandGroupProps,
  CommandItemProps,
  CommandListProps,
  CommandShortcutProps,
} from './command.types'
import styles from './CommandList.module.scss'

const CommandList = forwardRef<HTMLDivElement, CommandListProps>(({ children, ...props }, ref) => {
  return (
    <Box ref={ref} className={styles.list} {...props}>
      {children}
    </Box>
  )
})
CommandList.displayName = 'CommandList'

const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ children = 'No results found.', ...props }, ref) => {
    return (
      <Box ref={ref} className={styles.empty} {...props}>
        {children}
      </Box>
    )
  }
)
CommandEmpty.displayName = 'CommandEmpty'

const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ heading, children, ...props }, ref) => {
    return (
      <Box ref={ref} className={styles.group} {...props}>
        {heading && (
          <Typography
            variant="caption"
            className={styles.groupHeading}
          >
            {heading}
          </Typography>
        )}
        <List dense>
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
      <ListItem ref={ref} borderless {...props}>
        <ListItemButton
          onClick={onSelect}
          disabled={disabled}
          selected={selected}
          className={`${styles.itemButton} ${selected ? styles.selected : ''}`}
        >
          {icon && <ListItemIcon className={styles.itemIcon}>{icon}</ListItemIcon>}
          <ListItemText primary={children} />
          {shortcut && shortcut.length > 0 && (
            <Box className={styles.shortcutWrapper}>
              {shortcut.map((key, index) => (
                <kbd key={index} className={styles.kbd}>
                  {key}
                </kbd>
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
  return <Divider ref={ref} className={styles.separator} {...props} />
})
CommandSeparator.displayName = 'CommandSeparator'

const CommandShortcut = forwardRef<HTMLSpanElement, CommandShortcutProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="span"
        className={styles.shortcut}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
CommandShortcut.displayName = 'CommandShortcut'

export { CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator, CommandShortcut }
