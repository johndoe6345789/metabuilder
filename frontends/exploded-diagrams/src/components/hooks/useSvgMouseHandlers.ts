'use client'

import { useCallback } from 'react'
import type React from 'react'

interface UseSvgMouseHandlersProps {
  onPartHover: (partId: string | null, event?: MouseEvent) => void
}

export function useSvgMouseHandlers({
  onPartHover,
}: UseSvgMouseHandlersProps) {
  const handleMouseOver = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const target = (e.target as Element)
        .closest('.part') as Element | null
      if (target) {
        const partId = target.getAttribute('data-part')
        if (partId) onPartHover(partId, e.nativeEvent)
      }
    },
    [onPartHover]
  )

  const handleMouseOut = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const target = (e.target as Element).closest('.part')
      if (target) onPartHover(null)
    },
    [onPartHover]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const target = (e.target as Element)
        .closest('.part') as Element | null
      if (target) {
        const partId = target.getAttribute('data-part')
        if (partId) onPartHover(partId, e.nativeEvent)
      }
    },
    [onPartHover]
  )

  return { handleMouseOver, handleMouseOut, handleMouseMove }
}
