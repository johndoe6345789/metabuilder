'use client'

import { useCallback } from 'react'
import type { Geometry } from '@/lib/types'
import { renderShape } from './svgShapes'

export function useGeometryRenderer() {
  const getFill = useCallback(
    (geo: Geometry, partMaterial: string): string => {
      if (geo.fill) return geo.fill
      const mat = geo.material || partMaterial
      return mat ? `url(#grad-${mat})` : '#888'
    },
    []
  )

  const renderGeometry = useCallback(
    (
      geo: Geometry,
      cx: number,
      cy: number,
      partMaterial: string
    ): string => {
      const x = cx + (geo.offsetX || 0)
      const y = cy + (geo.offsetY || 0)
      const fill = getFill(geo, partMaterial)
      return renderShape(geo, x, y, fill)
    },
    [getFill]
  )

  return { renderGeometry }
}
