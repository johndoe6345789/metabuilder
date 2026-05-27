'use client'

import { useState, useCallback } from 'react'
import type { Assembly, Part } from '@/lib/types'

interface TooltipState {
  part: Part
  x: number
  y: number
}

export function useAssemblyInteraction(data: Assembly | null) {
  const [highlightedPart, setHighlightedPart] = useState<string | null>(null)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const handlePartHover = useCallback(
    (partId: string | null, event?: MouseEvent) => {
      setHighlightedPart(partId)
      if (partId && data && event) {
        const part = data.parts.find(p => p.id === partId)
        if (part) {
          setTooltip({ part, x: event.clientX, y: event.clientY })
          return
        }
      }
      setTooltip(null)
    },
    [data]
  )

  const handlePartSelect = useCallback(
    (partId: string | null) => {
      if (partId && data) {
        const part = data.parts.find(p => p.id === partId)
        setSelectedPart(part || null)
      } else {
        setSelectedPart(null)
      }
    },
    [data]
  )

  return {
    highlightedPart,
    selectedPart,
    tooltip,
    handlePartHover,
    handlePartSelect,
  }
}
