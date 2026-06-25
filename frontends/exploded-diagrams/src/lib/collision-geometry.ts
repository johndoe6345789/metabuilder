/**
 * Per-primitive bounding box calculations for AABB collision detection
 */

import type { Geometry } from './types'
import type { BoundingBox } from './collision-bounds'

/** Calculate the bounding box for a single geometry primitive */
export function getGeometryBounds(
  geo: Geometry, cx: number, cy: number
): BoundingBox {
  const x = cx + (geo.offsetX || 0)
  const y = cy + (geo.offsetY || 0)
  switch (geo.type) {
    case 'circle': {
      const r = geo.r || 0
      return { minX: x-r, minY: y-r, maxX: x+r, maxY: y+r,
        width: r*2, height: r*2 }
    }
    case 'ellipse': {
      const rx = geo.rx || 0; const ry = geo.ry || 0
      return { minX: x-rx, minY: y-ry, maxX: x+rx, maxY: y+ry,
        width: rx*2, height: ry*2 }
    }
    case 'rect': {
      const w = geo.width || 0; const h = geo.height || 0
      return { minX: x-w/2, minY: y-h/2, maxX: x+w/2, maxY: y+h/2,
        width: w, height: h }
    }
    case 'cylinder': {
      const rx = geo.rx || 0; const h = geo.height || 0
      return { minX: x-rx, minY: y-h/2, maxX: x+rx, maxY: y+h/2,
        width: rx*2, height: h }
    }
    case 'cone': {
      const maxRx = Math.max(geo.topRx || 0, geo.bottomRx || 0)
      const h = geo.height || 0
      return { minX: x-maxRx, minY: y-h/2, maxX: x+maxRx, maxY: y+h/2,
        width: maxRx*2, height: h }
    }
    case 'coilSpring': {
      const rx = geo.rx || 0
      const totalH = (geo.coils || 0) * (geo.pitch || 0)
      return { minX: x-rx, minY: y, maxX: x+rx, maxY: y+totalH,
        width: rx*2, height: totalH }
    }
    case 'gearRing': {
      const outerR = (geo.outerRadius || 0) + (geo.toothHeight || 0)
      return {
        minX: x-outerR, minY: y-outerR*0.5,
        maxX: x+outerR, maxY: y+outerR*0.5,
        width: outerR*2, height: outerR,
      }
    }
    case 'radialRects':
    case 'radialBlades': {
      const size = (geo.radius || 0) +
        Math.max(geo.width || 0, geo.height || 0)
      const h = geo.height || 0
      return { minX: x-size, minY: y-h, maxX: x+size, maxY: y+h,
        width: size*2, height: h*2 }
    }
    case 'text': {
      const fs = geo.fontSize || 10
      const tl = (geo.content?.length || 0) * fs * 0.6
      return { minX: x-tl/2, minY: y-fs/2, maxX: x+tl/2, maxY: y+fs/2,
        width: tl, height: fs }
    }
    case 'line':
    case 'polygon':
    default:
      return { minX: x-10, minY: y-10, maxX: x+10, maxY: y+10,
        width: 20, height: 20 }
  }
}
