'use client'

import { ReactNode } from 'react'

import { CommandDialog } from '../command'

interface CommandPaletteProps {
  children: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  placeholder?: string
  search: string
  onSearchChange: (value: string) => void
}

const CommandPalette = ({
  children,
  open,
  onOpenChange,
  placeholder = 'Type a command or search...',
  search,
  onSearchChange,
}: CommandPaletteProps) => {
  return (
    <CommandDialog open={open} onClose={() => onOpenChange(false)}>
      <CommandDialog.Input
        value={search}
        onChange={onSearchChange}
        placeholder={placeholder}
        autoFocus
      />
      {children}
    </CommandDialog>
  )
}

export { CommandPalette }
export type { CommandPaletteProps }
