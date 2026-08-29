/** What the showcase renders, and what each variant is built from. */

import type React from 'react'

export interface ShowcaseItem {
  id: string
  name: string
  component: React.ReactNode
}

export interface ShowcaseOptions {
  size: 'compact' | 'normal' | 'large'
  animationsEnabled: boolean
  onCreate: () => void
  onAction: () => void
  onRetry: () => void
}
