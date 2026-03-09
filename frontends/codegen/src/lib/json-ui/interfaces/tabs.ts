import { ReactNode } from 'react'

export interface Tab {
  id: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
  className?: string
}
