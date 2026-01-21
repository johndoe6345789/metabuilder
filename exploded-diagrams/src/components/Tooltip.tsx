'use client'

import type { Part, Materials } from '@/lib/types'

interface TooltipProps {
  tooltip: { part: Part; x: number; y: number } | null
  materials: Materials
}

export default function Tooltip({ tooltip, materials }: TooltipProps) {
  if (!tooltip) return null

  const { part, x, y } = tooltip
  const mat = materials[part.material]

  return (
    <div
      className="tooltip visible"
      style={{ left: x + 15, top: y - 10 }}
    >
      <h4>{part.name}</h4>
      <div className="details">
        <div>{part.partNumber} × {part.quantity}</div>
        <div>{part.weight}g each</div>
        <span className="material">{mat?.name || part.material}</span>
      </div>
    </div>
  )
}
