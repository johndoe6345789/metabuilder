'use client'

import {
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuItemProps,
  MenuProps,
  Typography,
} from '@mui/material'
import { forwardRef, MouseEvent as ReactMouseEvent, ReactNode } from 'react'

import { Check, ChevronRight } from '@/fakemui/icons'

// DropdownMenu (uses MUI Menu under the hood)
export interface DropdownMenuProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const DropdownMenu = ({ children, open, onOpenChange }: DropdownMenuProps) => {
  return <>{children}</>
}
DropdownMenu.displayName = 'DropdownMenu'

// DropdownMenuTrigger
interface DropdownMenuTriggerProps {
  children: ReactNode
  asChild?: boolean
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void
}

const DropdownMenuTrigger = forwardRef<HTMLDivElement, DropdownMenuTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        onClick={onClick}
        sx={{ display: 'inline-flex', cursor: 'pointer' }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

// DropdownMenuContent
export interface DropdownMenuContentProps extends Omit<MenuProps, 'open'> {
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
}

const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, align = 'start', side = 'bottom', anchorEl, onClose, ...props }, ref) => {
    const anchorOrigin = {
      vertical: side === 'top' ? 'top' : 'bottom',
      horizontal: align === 'end' ? 'right' : align === 'center' ? 'center' : 'left',
    } as const

    return (
      <Menu
        ref={ref}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={{
          vertical: side === 'top' ? 'bottom' : 'top',
          horizontal: anchorOrigin.horizontal,
        }}
        PaperProps={{
          sx: { minWidth: 160, borderRadius: 1, mt: 0.5 },
        }}
        {...props}
      >
        {children}
      </Menu>
    )
  }
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

// DropdownMenuItem
export interface DropdownMenuItemProps extends MenuItemProps {
  inset?: boolean
  icon?: ReactNode
  shortcut?: string
}

const DropdownMenuItem = forwardRef<HTMLLIElement, DropdownMenuItemProps>(
  ({ children, inset, icon, shortcut, sx, ...props }, ref) => {
    return (
      <MenuItem
        ref={ref}
        sx={{
          py: 0.75,
          px: 2,
          fontSize: '0.875rem',
          ...(inset && { pl: 6 }),
          ...sx,
        }}
        {...props}
      >
        {icon && <ListItemIcon sx={{ minWidth: 28 }}>{icon}</ListItemIcon>}
        <ListItemText>{children}</ListItemText>
        {shortcut && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            {shortcut}
          </Typography>
        )}
      </MenuItem>
    )
  }
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

// DropdownMenuCheckboxItem
interface DropdownMenuCheckboxItemProps extends Omit<MenuItemProps, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const DropdownMenuCheckboxItem = forwardRef<HTMLLIElement, DropdownMenuCheckboxItemProps>(
  ({ children, checked, onCheckedChange, ...props }, ref) => {
    return (
      <MenuItem
        ref={ref}
        onClick={() => onCheckedChange?.(!checked)}
        sx={{ py: 0.75, px: 2 }}
        {...props}
      >
        <ListItemIcon sx={{ minWidth: 28 }}>
          {checked && <CheckIcon fontSize="small" />}
        </ListItemIcon>
        <ListItemText>{children}</ListItemText>
      </MenuItem>
    )
  }
)
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

// DropdownMenuLabel
const DropdownMenuLabel = forwardRef<
  HTMLDivElement,
  { children: ReactNode; inset?: boolean; className?: string }
>(({ children, inset, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        px: 2,
        py: 0.75,
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'text.secondary',
        ...(inset && { pl: 6 }),
      }}
      {...props}
    >
      {children}
    </Box>
  )
})
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

// DropdownMenuSeparator
const DropdownMenuSeparator = forwardRef<HTMLHRElement>((props, ref) => {
  return <Divider ref={ref} sx={{ my: 0.5 }} {...props} />
})
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

// DropdownMenuShortcut
const DropdownMenuShortcut = ({ children }: { children: ReactNode }) => {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', pl: 2 }}>
      {children}
    </Typography>
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

// DropdownMenuGroup
const DropdownMenuGroup = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} {...props}>
        {children}
      </Box>
    )
  }
)
DropdownMenuGroup.displayName = 'DropdownMenuGroup'

// DropdownMenuSub (submenu)
const DropdownMenuSub = ({ children }: { children: ReactNode }) => <>{children}</>
DropdownMenuSub.displayName = 'DropdownMenuSub'

// DropdownMenuSubTrigger
const DropdownMenuSubTrigger = forwardRef<
  HTMLLIElement,
  { children: ReactNode; inset?: boolean; className?: string }
>(({ children, inset, ...props }, ref) => {
  return (
    <MenuItem ref={ref} sx={{ py: 0.75, px: 2, ...(inset && { pl: 6 }) }} {...props}>
      <ListItemText>{children}</ListItemText>
      <ChevronRightIcon fontSize="small" sx={{ ml: 1 }} />
    </MenuItem>
  )
})
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'

// DropdownMenuSubContent
const DropdownMenuSubContent = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string }
>(({ children, ...props }, ref) => {
  return (
    <Box ref={ref} {...props}>
      {children}
    </Box>
  )
})
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent'

// DropdownMenuPortal
const DropdownMenuPortal = ({ children }: { children: ReactNode }) => <>{children}</>
DropdownMenuPortal.displayName = 'DropdownMenuPortal'

// DropdownMenuRadioGroup
const DropdownMenuRadioGroup = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode
    value?: string
    onValueChange?: (value: string) => void
    className?: string
  }
>(({ children, ...props }, ref) => {
  return (
    <Box ref={ref} {...props}>
      {children}
    </Box>
  )
})
DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup'

// DropdownMenuRadioItem
const DropdownMenuRadioItem = forwardRef<
  HTMLLIElement,
  { children: ReactNode; value: string; className?: string }
>(({ children, value, ...props }, ref) => {
  return (
    <MenuItem ref={ref} value={value} sx={{ py: 0.75, px: 2 }} {...props}>
      <ListItemIcon sx={{ minWidth: 28 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
      </ListItemIcon>
      <ListItemText>{children}</ListItemText>
    </MenuItem>
  )
})
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem'

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
