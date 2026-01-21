import { ReactNode } from 'react'

export interface CommandOption {
  value: string
  label: string
  icon?: ReactNode
  onSelect?: () => void
}

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  placeholder?: string
  emptyMessage?: string
  groups: {
    heading?: string
    items: CommandOption[]
  }[]
}
