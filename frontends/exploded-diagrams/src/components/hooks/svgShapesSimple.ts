import type { Geometry } from '@/lib/types'

export function renderSimpleShape(
  geo: Geometry,
  x: number,
  y: number,
  fill: string
): string | null {
  const op =
    geo.opacity !== undefined ? `opacity="${geo.opacity}"` : ''

  switch (geo.type) {
    case 'circle':
      return `<circle cx="${x}" cy="${y}" r="${geo.r}" fill="${fill}" ${op}/>`

    case 'ellipse':
      return `<ellipse cx="${x}" cy="${y}" rx="${geo.rx}" ry="${geo.ry}" fill="${fill}" ${op}/>`

    case 'rect': {
      const rx = geo.rx || 0
      const w = geo.width || 0
      const h = geo.height || 0
      return (
        `<rect x="${x - w / 2}" y="${y - h / 2}" ` +
        `width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${op}/>`
      )
    }

    case 'line':
      return (
        `<line x1="${x + (geo.x1 || 0)}" y1="${y + (geo.y1 || 0)}" ` +
        `x2="${x + (geo.x2 || 0)}" y2="${y + (geo.y2 || 0)}" ` +
        `stroke="${geo.stroke}" stroke-width="${geo.strokeWidth}"/>`
      )

    case 'polygon': {
      const pts: string[] = []
      const points = geo.points || []
      for (let i = 0; i < points.length; i += 2) {
        pts.push(`${x + points[i]},${y + points[i + 1]}`)
      }
      const strokeAttr = geo.stroke
        ? `stroke="${geo.stroke}" stroke-width="${geo.strokeWidth || 1}"`
        : ''
      const fillAttr =
        geo.fill === 'none' ? 'fill="none"' : `fill="${fill}"`
      return `<polygon points="${pts.join(' ')}" ${fillAttr} ${strokeAttr}/>`
    }

    case 'text':
      return (
        `<text x="${x}" y="${y}" text-anchor="middle" ` +
        `fill="${geo.fill || '#333'}" font-size="${geo.fontSize || 10}" ` +
        `font-family="${geo.fontFamily || 'monospace'}">${geo.content}</text>`
      )

    default:
      return null
  }
}
