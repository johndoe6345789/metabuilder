import type { Geometry } from '@/lib/types'

export function renderComplexShape(
  geo: Geometry, x: number, y: number, fill: string
): string | null {
  switch (geo.type) {
    case 'cylinder': {
      const { rx = 0, ry = 0, height = 0 } = geo
      const t = y - height / 2
      const b = y + height / 2
      return (
        `<ellipse cx="${x}" cy="${t}" rx="${rx}" ry="${ry}"` +
          ` fill="${fill}"/>` +
        `<rect x="${x - rx}" y="${t}" width="${rx * 2}"` +
          ` height="${height}" fill="${fill}"/>` +
        `<ellipse cx="${x}" cy="${b}" rx="${rx}" ry="${ry}"` +
          ` fill="${fill}"/>`
      )
    }
    case 'cone': {
      const { topRx = 0, topRy = 0, bottomRx = 0, bottomRy = 0,
        height = 0 } = geo
      const t = y - height / 2
      const b = y + height / 2
      const path = `M${x-topRx},${t} L${x-bottomRx},${b} ` +
        `L${x+bottomRx},${b} L${x+topRx},${t} Z`
      return (
        `<ellipse cx="${x}" cy="${t}" rx="${topRx}" ry="${topRy}"` +
          ` fill="${fill}"/>` +
        `<path d="${path}" fill="${fill}"/>` +
        `<ellipse cx="${x}" cy="${b}" rx="${bottomRx}" ry="${bottomRy}"` +
          ` fill="${fill}"/>`
      )
    }
    case 'coilSpring': {
      const { coils = 0, rx = 0, ry = 0, pitch = 0, strokeWidth = 1 } = geo
      let svg = ''
      for (let i = 0; i < coils; i++) {
        const cy = y + i * pitch
        svg += `<ellipse cx="${x}" cy="${cy}" rx="${rx}" ry="${ry}"` +
          ` fill="none" stroke="${fill}" stroke-width="${strokeWidth}"/>`
      }
      return svg
    }
    case 'gearRing': {
      const { teeth = 0, outerRadius = 0, toothHeight = 0 } = geo
      let svg = ''
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2
        const tx = x + Math.cos(a) * outerRadius
        const ty = y + Math.sin(a) * (outerRadius * 0.35)
        const rot = (i / teeth) * 360
        svg += `<rect x="${tx - 3}" y="${ty - toothHeight / 2}"` +
          ` width="6" height="${toothHeight}" fill="${fill}"` +
          ` transform="rotate(${rot}, ${tx}, ${ty})"/>`
      }
      return svg
    }
    case 'radialRects': {
      const { count = 0, radius = 0, width: w = 0,
        height: h = 0, offsetY: oy = 0 } = geo
      const rf = geo.material ? `url(#grad-${geo.material})` : geo.fill || fill
      let svg = ''
      for (let i = 0; i < count; i++) {
        const rx2 = x + Math.cos((i / count) * Math.PI * 2) * radius
        svg += `<rect x="${rx2 - w / 2}" y="${y + oy}"` +
          ` width="${w}" height="${h}" fill="${rf}" rx="1"/>`
      }
      return svg
    }
    case 'radialBlades': {
      const { count = 0, radius = 0, width: w = 0,
        height: h = 0, curve = 0, offsetY: oy = 0 } = geo
      let svg = ''
      for (let i = 0; i < count; i++) {
        const bx = x + Math.cos((i / count) * Math.PI * 2) * radius
        const rot = (i / count) * 360 + curve
        svg += `<rect x="${bx - w / 2}" y="${y + oy}"` +
          ` width="${w}" height="${h}" fill="${fill}" rx="2"` +
          ` transform="rotate(${rot}, ${bx}, ${y + oy + h / 2})"/>`
      }
      return svg
    }
    default:
      return null
  }
}
