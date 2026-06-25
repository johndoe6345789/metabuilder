'use client'

import type { Assembly, Materials } from '@/lib/types'
import { useDiagramSvg } from './hooks/useDiagramSvg'
import { useSvgMouseHandlers } from './hooks/useSvgMouseHandlers'

interface DiagramRendererProps {
  assembly: Assembly
  materials: Materials
  explosion: number
  rotation: number
  highlightedPart: string | null
  onPartHover: (partId: string | null, event?: MouseEvent) => void
}

export default function DiagramRenderer({
  assembly,
  materials,
  explosion,
  rotation,
  highlightedPart,
  onPartHover,
}: DiagramRendererProps) {
  const { svgContent, canvasHeight } = useDiagramSvg({
    assembly,
    materials,
    explosion,
    rotation,
    highlightedPart,
  })

  const { handleMouseOver, handleMouseOut, handleMouseMove } =
    useSvgMouseHandlers({ onPartHover })

  return (
    <svg
      viewBox={`0 0 900 ${canvasHeight}`}
      style={{ width: '100%', height: 'auto' }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onMouseMove={handleMouseMove}
    />
  )
}
