'use client'

import { useMemo } from 'react'
import type { Assembly } from '@/lib/types'

export function useSidebarStats(assembly: Assembly) {
  return useMemo(() => {
    const totalParts = assembly.parts.reduce(
      (sum, p) => sum + p.quantity,
      0
    )
    const totalWeight = assembly.parts.reduce(
      (sum, p) => sum + p.weight * p.quantity,
      0
    )
    const uniqueMaterials = [
      ...new Set(assembly.parts.map(p => p.material)),
    ]
    const weightLabel =
      totalWeight < 1000
        ? `${totalWeight.toFixed(0)}g`
        : `${(totalWeight / 1000).toFixed(2)}kg`

    return { totalParts, totalWeight, uniqueMaterials, weightLabel }
  }, [assembly])
}
