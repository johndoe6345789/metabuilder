'use client'

import { useState, useMemo, useCallback } from 'react'
import type { Part } from '@/lib/types'

export function useSelectedPart(parts: Part[]) {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(
    parts.length > 0 ? parts[0].id : null
  )

  const selectedPart = useMemo(
    () => parts.find(p => p.id === selectedPartId) ?? null,
    [parts, selectedPartId]
  )

  const handleSelectPart = useCallback((partId: string) => {
    setSelectedPartId(partId)
  }, [])

  return { selectedPartId, selectedPart, handleSelectPart }
}
