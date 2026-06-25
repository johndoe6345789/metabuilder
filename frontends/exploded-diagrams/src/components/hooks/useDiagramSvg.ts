'use client'

import { useMemo } from 'react'
import type { Assembly, Materials } from '@/lib/types'
import { positionPartsWithCollision } from '@/lib/collision'
import { useGeometryRenderer } from './useGeometryRenderer'
import { buildSvgDefs } from './svgDefs'
import { renderPartGroup } from './svgPartGroup'

interface Params {
  assembly: Assembly
  materials: Materials
  explosion: number
  rotation: number
  highlightedPart: string | null
}

const CENTER_X = 350
const BASE_OFFSET = 90
const MAX_EXPLOSION = 70
const MIN_HEIGHT = 750
const FOOTER_PAD = 50

export function useDiagramSvg({
  assembly,
  materials,
  explosion,
  rotation,
  highlightedPart,
}: Params) {
  const { renderGeometry } = useGeometryRenderer()

  return useMemo(() => {
    const positionedParts = positionPartsWithCollision(
      assembly.parts,
      CENTER_X,
      BASE_OFFSET,
      explosion / 100,
      MAX_EXPLOSION
    )

    let maxY = MIN_HEIGHT - FOOTER_PAD
    for (const { bbox } of positionedParts) {
      if (bbox.maxY > maxY) maxY = bbox.maxY
    }
    const canvasHeight = Math.max(MIN_HEIGHT, maxY + FOOTER_PAD)

    let svg = buildSvgDefs(materials)
    svg += `<rect width="900" height="${canvasHeight}" fill="#fafafa"/>`
    svg += `
      <text x="350" y="35" text-anchor="middle"
        font-family="Arial Black" font-size="18" fill="#1a1a1a">
        ${assembly.name.toUpperCase()}
      </text>
      <text x="350" y="52" text-anchor="middle"
        font-family="Arial" font-size="10" fill="#888">
        ${assembly.description || ''}
      </text>
      <line x1="150" y1="65" x2="550" y2="65"
        stroke="#e0e0e0" stroke-width="1.5"/>
      <line x1="${CENTER_X}" y1="80" x2="${CENTER_X}"
        y2="${canvasHeight - 30}" stroke="#ddd"
        stroke-width="1" stroke-dasharray="6,3"/>
    `

    positionedParts.forEach((positioned, i) => {
      svg += renderPartGroup(
        positioned, i, highlightedPart, rotation, CENTER_X, renderGeometry
      )
    })

    const totalWeight = assembly.parts.reduce(
      (sum, p) => sum + p.weight * p.quantity,
      0
    )
    svg += `
      <text x="20" y="${canvasHeight - 15}"
        font-family="Arial" font-size="8" fill="#aaa">
        ${assembly.parts.length} unique parts
        • ${totalWeight.toFixed(1)}g total weight
      </text>
    `

    return { svgContent: svg, canvasHeight }
  }, [assembly, materials, explosion, rotation, highlightedPart, renderGeometry])
}
