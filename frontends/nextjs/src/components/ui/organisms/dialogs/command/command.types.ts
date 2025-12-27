import { ReactNode } from 'react'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  shortcut?: string[]
  onSelect?: () => void
  disabled?: boolean
  keywords?: string[]
}

interface CommandGroup {
  heading?: string
  items: CommandItem[]
}

interface CommandDialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

interface CommandInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  autoFocus?: boolean
}

interface CommandListProps {
  children: ReactNode
}

interface CommandEmptyProps {
  children?: ReactNode
}

interface CommandGroupProps {
  heading?: string
  children: ReactNode
}

interface CommandItemProps {
  children?: ReactNode
  icon?: ReactNode
  shortcut?: string[]
  onSelect?: () => void
  disabled?: boolean
  selected?: boolean
}

interface CommandShortcutProps {
  children: ReactNode
}

export type {
  CommandDialogProps,
  CommandEmptyProps,
  CommandGroup,
  CommandGroupProps,
  CommandInputProps,
  CommandItem,
  CommandItemProps,
  CommandListProps,
  CommandShortcutProps,
}
