import type { Geometry } from '@/lib/types'
import type { PositionedPart } from '@/lib/collision'

type RenderGeo = (
  geo: Geometry,
  cx: number,
  cy: number,
  mat: string
) => string

export function renderPartGroup(
  { part, y: baseY, bbox }: PositionedPart,
  index: number,
  highlighted: string | null,
  rotation: number,
  centerX: number,
  renderGeometry: RenderGeo
): string {
  const filter =
    highlighted === part.id ? 'url(#glow)' : 'url(#dropShadow)'
  const transform =
    rotation !== 0
      ? `transform="rotate(${rotation}, ${centerX}, ${baseY})"`
      : ''

  let svg =
    `<g class="part" data-part="${part.id}" ` +
    `filter="${filter}" ${transform} style="cursor:pointer">`
  part.geometry.forEach(geo => {
    svg += renderGeometry(geo, centerX, baseY, part.material)
  })
  svg += '</g>'

  const side = index % 2 === 0 ? 1 : -1
  const labelX = centerX + side * 180
  const lineX = side === 1 ? bbox.maxX + 5 : bbox.minX - 5
  const anchor = side === 1 ? 'start' : 'end'
  svg +=
    `<line x1="${lineX}" y1="${baseY}" ` +
    `x2="${labelX - side * 8}" y2="${baseY}" ` +
    `stroke="#888" stroke-width="0.6"/>` +
    `<circle cx="${labelX - side * 8}" cy="${baseY}" r="2.5" fill="#888"/>` +
    `<text x="${labelX}" y="${baseY - 3}" text-anchor="${anchor}" ` +
    `font-family="Arial" font-size="10" font-weight="bold" ` +
    `fill="#333">${part.name}</text>` +
    `<text x="${labelX}" y="${baseY + 9}" text-anchor="${anchor}" ` +
    `font-family="monospace" font-size="8" ` +
    `fill="#777">${part.partNumber}</text>`
  return svg
}
