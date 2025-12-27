import { ReactNode } from 'react'

interface CommandItemType {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  shortcut?: string[]
  onSelect?: () => void
  disabled?: boolean
  keywords?: string[]
}

interface CommandGroupType {
  heading?: string
  items: CommandItemType[]
}

export type { CommandGroupType, CommandItemType }
