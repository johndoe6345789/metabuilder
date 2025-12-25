'use client'

import { forwardRef, ReactNode } from 'react'
import { Menu, MenuItem, IconButton, MenuProps, ListItemIcon, ListItemText, Divider, Box } from '@mui/material'
import { useState } from 'react'

interface DropdownMenuProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const DropdownMenu = ({ children }: DropdownMenuProps) => <>{children}</>
DropdownMenu.displayName = 'DropdownMenu'

interface DropdownMenuTriggerProps {
  children: ReactNode
  asChild?: boolean
}

const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    return (
      <Box ref={ref as unknown as React.Ref<HTMLDivElement>} sx={{ display: 'inline-flex' }} {...props}>
        {children}
      </Box>
    )
  }
)
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

interface DropdownMenuContentProps {
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  className?: string
}

const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} {...props}>
        {children}
      </Box>
    )
  }
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

interface DropdownMenuItemProps {
  children: ReactNode
  disabled?: boolean
  onSelect?: () => void
  onClick?: () => void
  className?: string
  inset?: boolean
}

const DropdownMenuItem = forwardRef<HTMLLIElement, DropdownMenuItemProps>(
  ({ children, disabled, onSelect, onClick, inset, ...props }, ref) => {
    return (
      <MenuItem
        ref={ref}
        disabled={disabled}
        onClick={onSelect || onClick}
        sx={{
          fontSize: '0.875rem',
          py: 1,
          px: 2,
          pl: inset ? 4 : 2,
          minHeight: 'auto',
        }}
        {...props}
      >
        {children}
      </MenuItem>
    )
  }
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

interface DropdownMenuLabelProps {
  children: ReactNode
  className?: string
  inset?: boolean
}

const DropdownMenuLabel = forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ children, inset, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          px: 2,
          py: 1,
          pl: inset ? 4 : 2,
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

const DropdownMenuSeparator = forwardRef<HTMLHRElement>((props, ref) => {
  return <Divider ref={ref} sx={{ my: 0.5 }} {...props} />
})
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

interface DropdownMenuShortcutProps {
  children: ReactNode
  className?: string
}

const DropdownMenuShortcut = ({ children, ...props }: DropdownMenuShortcutProps) => {
  return (
    <Box
      component="span"
      sx={{
        ml: 'auto',
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        color: 'text.secondary',
      }}
      {...props}
    >
      {children}
    </Box>
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

const DropdownMenuGroup = ({ children }: { children: ReactNode }) => <>{children}</>
DropdownMenuGroup.displayName = 'DropdownMenuGroup'

const DropdownMenuPortal = ({ children }: { children: ReactNode }) => <>{children}</>
DropdownMenuPortal.displayName = 'DropdownMenuPortal'

const DropdownMenuSub = ({ children }: { children: ReactNode }) => <>{children}</>
DropdownMenuSub.displayName = 'DropdownMenuSub'

const DropdownMenuSubContent = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children, ...props }, ref) => <Box ref={ref} {...props}>{children}</Box>
)
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent'

const DropdownMenuSubTrigger = forwardRef<HTMLLIElement, DropdownMenuItemProps>(
  ({ children, ...props }, ref) => (
    <MenuItem ref={ref} {...props}>{children}</MenuItem>
  )
)
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'

interface DropdownMenuCheckboxItemProps extends DropdownMenuItemProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const DropdownMenuCheckboxItem = forwardRef<HTMLLIElement, DropdownMenuCheckboxItemProps>(
  ({ children, checked, onCheckedChange, ...props }, ref) => (
    <MenuItem ref={ref} onClick={() => onCheckedChange?.(!checked)} {...props}>
      {children}
    </MenuItem>
  )
)
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

interface DropdownMenuRadioGroupProps {
  children: ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

const DropdownMenuRadioGroup = ({ children }: DropdownMenuRadioGroupProps) => <>{children}</>
DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup'

interface DropdownMenuRadioItemProps extends DropdownMenuItemProps {
  value: string
}

const DropdownMenuRadioItem = forwardRef<HTMLLIElement, DropdownMenuRadioItemProps>(
  ({ children, value, ...props }, ref) => (
    <MenuItem ref={ref} {...props}>{children}</MenuItem>
  )
)
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
}
