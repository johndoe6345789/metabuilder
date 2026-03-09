import { ComponentType } from 'react'

export interface ShowcaseExample {
  key: string
  name: string
  description: string
  icon: ComponentType<{ size?: number }>
  config: Record<string, any>
}

export interface ShowcaseTabsCopy {
  showJsonLabel: string
  showPreviewLabel: string
  jsonTitle: string
}

export interface ShowcaseHeaderCopy {
  title: string
  description: string
  badge: string
}

export interface ShowcaseFooterItem {
  label: string
  colorClass: string
}
