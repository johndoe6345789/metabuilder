import type { ReactNode } from 'react'

import { Badge } from '@/components/ui'

export interface DBALTabConfig {
  value: string
  label: string
  content: ReactNode
}

export const DBAL_CONTAINER_CLASS = 'container mx-auto p-6 max-w-6xl'
export const DBAL_TAB_GRID_CLASS = 'grid w-full grid-cols-3'

export function renderInitializationBadge(isReady: boolean, message: string) {
  if (isReady) return null

  return <Badge variant="outline">{message}</Badge>
}
