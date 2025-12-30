'use client'

import { forwardRef, MouseEvent as ReactMouseEvent, ReactNode } from 'react'

import { Box, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@/fakemui'
import { Check, ChevronRight } from '@/fakemui/icons'

// DropdownMenu (uses FakeMUI Menu under the hood)
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
        className="dropdown-menu-trigger"
        {...props}
      >
        {children}
      </Box>
    )
  }
)
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

// DropdownMenuContent
export interface DropdownMenuContentProps {
  children?: ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  anchorEl?: HTMLElement | null
  onClose?: () => void
  className?: string
}

const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, align = 'start', side = 'bottom', anchorEl, onClose, className, ...props }, ref) => {
    return (
      <Menu
        ref={ref}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        className={`dropdown-menu-content ${className || ''}`}
        {...props}
      >
        {children}
      </Menu>
    )
  }
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

// DropdownMenuItem
export interface DropdownMenuItemProps {
  children?: ReactNode
  inset?: boolean
  icon?: ReactNode
  shortcut?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ children, inset, icon, shortcut, className, ...props }, ref) => {
    return (
      <MenuItem
        ref={ref}
        className={`dropdown-menu-item ${inset ? 'dropdown-menu-item--inset' : ''} ${className || ''}`}
        {...props}
      >
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText>{children}</ListItemText>
        {shortcut && (
          <Typography variant="caption" className="dropdown-menu-shortcut">
            {shortcut}
          </Typography>
        )}
      </MenuItem>
    )
  }
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

// DropdownMenuCheckboxItem
interface DropdownMenuCheckboxItemProps {
  children?: ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

const DropdownMenuCheckboxItem = forwardRef<HTMLButtonElement, DropdownMenuCheckboxItemProps>(
  ({ children, checked, onCheckedChange, className, ...props }, ref) => {
    return (
      <MenuItem
        ref={ref}
        onClick={() => onCheckedChange?.(!checked)}
        className={`dropdown-menu-checkbox-item ${className || ''}`}
        {...props}
      >
        <ListItemIcon>
          {checked && <Check size={16} />}
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
>(({ children, inset, className, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      className={`dropdown-menu-label ${inset ? 'dropdown-menu-label--inset' : ''} ${className || ''}`}
      {...props}
    >
      {children}
    </Box>
  )
})
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

// DropdownMenuSeparator
const DropdownMenuSeparator = forwardRef<HTMLHRElement, { className?: string }>((props, ref) => {
  return <Divider ref={ref} className="dropdown-menu-separator" {...props} />
})
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

// DropdownMenuShortcut
const DropdownMenuShortcut = ({ children }: { children: ReactNode }) => {
  return (
    <Typography variant="caption" className="dropdown-menu-shortcut">
      {children}
    </Typography>
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

// DropdownMenuGroup
const DropdownMenuGroup = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <Box ref={ref} className={`dropdown-menu-group ${className || ''}`} {...props}>
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
  HTMLButtonElement,
  { children: ReactNode; inset?: boolean; className?: string }
>(({ children, inset, className, ...props }, ref) => {
  return (
    <MenuItem
      ref={ref}
      className={`dropdown-menu-sub-trigger ${inset ? 'dropdown-menu-sub-trigger--inset' : ''} ${className || ''}`}
      {...props}
    >
      <ListItemText>{children}</ListItemText>
      <ChevronRight size={16} />
    </MenuItem>
  )
})
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'

// DropdownMenuSubContent
const DropdownMenuSubContent = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string }
>(({ children, className, ...props }, ref) => {
  return (
    <Box ref={ref} className={`dropdown-menu-sub-content ${className || ''}`} {...props}>
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
>(({ children, className, ...props }, ref) => {
  return (
    <Box ref={ref} className={`dropdown-menu-radio-group ${className || ''}`} {...props}>
      {children}
    </Box>
  )
})
DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup'

// DropdownMenuRadioItem
const DropdownMenuRadioItem = forwardRef<
  HTMLButtonElement,
  { children: ReactNode; value: string; className?: string }
>(({ children, value, className, ...props }, ref) => {
  return (
    <MenuItem ref={ref} className={`dropdown-menu-radio-item ${className || ''}`} {...props}>
      <ListItemIcon>
        <Box className="dropdown-menu-radio-dot" />
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
