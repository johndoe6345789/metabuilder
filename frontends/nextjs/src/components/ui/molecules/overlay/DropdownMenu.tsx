'use client'

import { Box } from '@/fakemui/fakemui/layout'
import { MenuItem } from '@/fakemui/fakemui/navigation'
import { Divider } from '@/fakemui/fakemui/data-display'
import { forwardRef, ReactNode } from 'react'
import styles from './DropdownMenu.module.scss'

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
  className?: string
}

const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, asChild, className = '', ...props }, ref) => {
    return (
      <Box
        ref={ref as unknown as React.Ref<HTMLElement>}
        className={`${styles.dropdownMenuTrigger} ${className}`}
        {...props}
      >
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
  ({ children, className = '', ...props }, ref) => {
    return (
      <Box ref={ref} className={`${styles.dropdownMenuContent} ${className}`} {...props}>
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

const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ children, disabled, onSelect, onClick, inset, className = '', ...props }, ref) => {
    return (
      <MenuItem
        ref={ref}
        disabled={disabled}
        onClick={onSelect || onClick}
        className={`${styles.dropdownMenuItem} ${inset ? styles.inset : ''} ${className}`}
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
  ({ children, inset, className = '', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={`${styles.dropdownMenuLabel} ${inset ? styles.inset : ''} ${className}`}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

interface DropdownMenuSeparatorProps {
  className?: string
}

const DropdownMenuSeparator = forwardRef<HTMLHRElement, DropdownMenuSeparatorProps>(
  ({ className = '', ...props }, ref) => {
    return <Divider ref={ref} className={`${styles.dropdownMenuSeparator} ${className}`} {...props} />
  }
)
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

interface DropdownMenuShortcutProps {
  children: ReactNode
  className?: string
}

const DropdownMenuShortcut = ({ children, className = '', ...props }: DropdownMenuShortcutProps) => {
  return (
    <span className={`${styles.dropdownMenuShortcut} ${className}`} {...props}>
      {children}
    </span>
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

const DropdownMenuGroup = ({ children }: { children: ReactNode }) => <>{children}</>
DropdownMenuGroup.displayName = 'DropdownMenuGroup'

const DropdownMenuPortal = ({ children }: { children: ReactNode }) => <>{children}</>
DropdownMenuPortal.displayName = 'DropdownMenuPortal'

const DropdownMenuSub = ({ children }: { children: ReactNode }) => <>{children}</>
DropdownMenuSub.displayName = 'DropdownMenuSub'

const DropdownMenuSubContent = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className = '', ...props }, ref) => (
    <Box ref={ref} className={className} {...props}>
      {children}
    </Box>
  )
)
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent'

const DropdownMenuSubTrigger = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ children, className = '', ...props }, ref) => (
    <MenuItem ref={ref} className={className} {...props}>
      {children}
    </MenuItem>
  )
)
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'

interface DropdownMenuCheckboxItemProps extends DropdownMenuItemProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const DropdownMenuCheckboxItem = forwardRef<HTMLButtonElement, DropdownMenuCheckboxItemProps>(
  ({ children, checked, onCheckedChange, className = '', ...props }, ref) => (
    <MenuItem ref={ref} onClick={() => onCheckedChange?.(!checked)} className={className} {...props}>
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

const DropdownMenuRadioItem = forwardRef<HTMLButtonElement, DropdownMenuRadioItemProps>(
  ({ children, value, className = '', ...props }, ref) => (
    <MenuItem ref={ref} className={className} {...props}>
      {children}
    </MenuItem>
  )
)
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
