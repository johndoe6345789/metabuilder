'use client'

import { forwardRef, ReactNode } from 'react'

import { Box, Input } from '@/fakemui'
import { Search } from '@/fakemui/icons'

// CommandDialog
interface CommandDialogProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const CommandDialog = ({ children, open, onOpenChange }: CommandDialogProps) => {
  if (!open) return null
  return (
    <Box className="command-dialog-overlay" onClick={() => onOpenChange?.(false)}>
      <Box onClick={e => e.stopPropagation()} className="command-dialog-content">
        {children}
      </Box>
    </Box>
  )
}
CommandDialog.displayName = 'CommandDialog'

// CommandInput
interface CommandInputProps {
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  ({ placeholder = 'Search...', value, onValueChange, className, ...props }, ref) => {
    return (
      <Box className={`command-input-wrapper ${className || ''}`}>
        <Input
          ref={ref}
          fullWidth
          size="sm"
          placeholder={placeholder}
          value={value}
          onChange={e => onValueChange?.(e.target.value)}
          startAdornment={<Search size={16} className="command-input-icon" />}
          className="command-input"
          {...props}
        />
      </Box>
    )
  }
)
CommandInput.displayName = 'CommandInput'

export { CommandDialog, CommandInput }
