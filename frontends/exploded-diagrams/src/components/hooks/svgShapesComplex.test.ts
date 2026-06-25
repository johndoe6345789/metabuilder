import { describe, it, expect } from 'vitest'
import { renderComplexShape } from './svgShapesComplex'
import type { Geometry } from '@/lib/types'

describe('renderComplexShape', () => {
  describe('cylinder', () => {
    it('renders top ellipse, rect body, and bottom ellipse', () => {
      const geo: Geometry = { type: 'cylinder', rx: 20, ry: 8, height: 40 }
      const result = renderComplexShape(geo, 100, 100, '#888')
      expect(result).not.toBeNull()
      // Should have 2 ellipses and 1 rect
      const ellipseCount = (result!.match(/<ellipse/g) || []).length
      expect(ellipseCount).toBe(2)
      expect(result).toContain('<rect')
    })

    it('places top ellipse above center and bottom below', () => {
      const geo: Geometry = { type: 'cylinder', rx: 15, ry: 5, height: 60 }
      // center y=100, height=60 → top = 100-30 = 70, bottom = 100+30 = 130
      const result = renderComplexShape(geo, 100, 100, '#888')!
      expect(result).toContain('cy="70"')  // top
      expect(result).toContain('cy="130"') // bottom
    })

    it('defaults rx, ry, height to 0 when missing', () => {
      const geo: Geometry = { type: 'cylinder' }
      const result = renderComplexShape(geo, 50, 50, '#000')
      expect(result).not.toBeNull()
    })
  })

  describe('cone', () => {
    it('renders top ellipse, path, and bottom ellipse', () => {
      const geo: Geometry = {
        type: 'cone',
        topRx: 5, topRy: 2,
        bottomRx: 15, bottomRy: 5,
        height: 40,
      }
      const result = renderComplexShape(geo, 100, 100, '#999')
      expect(result).not.toBeNull()
      const ellipseCount = (result!.match(/<ellipse/g) || []).length
      expect(ellipseCount).toBe(2)
      expect(result).toContain('<path')
    })

    it('defaults all dimensions to 0 when missing', () => {
      const geo: Geometry = { type: 'cone' }
      const result = renderComplexShape(geo, 0, 0, '#000')
      expect(result).not.toBeNull()
    })
  })

  describe('coilSpring', () => {
    it('renders one ellipse per coil', () => {
      const geo: Geometry = { type: 'coilSpring', coils: 5, rx: 20, ry: 5, pitch: 10, strokeWidth: 1 }
      const result = renderComplexShape(geo, 100, 100, '#aaa')
      expect(result).not.toBeNull()
      const ellipseCount = (result!.match(/<ellipse/g) || []).length
      expect(ellipseCount).toBe(5)
    })

    it('fills none and uses stroke', () => {
      const geo: Geometry = { type: 'coilSpring', coils: 2, rx: 10, ry: 4, pitch: 8, strokeWidth: 2 }
      const result = renderComplexShape(geo, 0, 0, '#blue')!
      expect(result).toContain('fill="none"')
      expect(result).toContain('stroke="#blue"')
      expect(result).toContain('stroke-width="2"')
    })

    it('returns empty string for 0 coils', () => {
      const geo: Geometry = { type: 'coilSpring', coils: 0 }
      const result = renderComplexShape(geo, 0, 0, '#000')
      expect(result).toBe('')
    })

    it('defaults all values to 0 when missing', () => {
      const geo: Geometry = { type: 'coilSpring' }
      const result = renderComplexShape(geo, 0, 0, '#000')
      expect(result).toBe('') // 0 coils → empty string
    })
  })

  describe('gearRing', () => {
    it('renders one rect per tooth', () => {
      const geo: Geometry = { type: 'gearRing', teeth: 8, outerRadius: 30, toothHeight: 5 }
      const result = renderComplexShape(geo, 100, 100, '#777')
      expect(result).not.toBeNull()
      const rectCount = (result!.match(/<rect/g) || []).length
      expect(rectCount).toBe(8)
    })

    it('returns empty string for 0 teeth', () => {
      const geo: Geometry = { type: 'gearRing', teeth: 0, outerRadius: 30, toothHeight: 5 }
      const result = renderComplexShape(geo, 100, 100, '#777')
      expect(result).toBe('')
    })

    it('includes rotation transforms', () => {
      const geo: Geometry = { type: 'gearRing', teeth: 4, outerRadius: 20, toothHeight: 4 }
      const result = renderComplexShape(geo, 100, 100, '#000')!
      expect(result).toContain('transform="rotate(')
    })

    it('defaults all values to 0', () => {
      const geo: Geometry = { type: 'gearRing' }
      const result = renderComplexShape(geo, 0, 0, '#000')
      expect(result).toBe('') // 0 teeth
    })
  })

  describe('radialRects', () => {
    it('renders one rect per count', () => {
      const geo: Geometry = { type: 'radialRects', count: 6, radius: 30, width: 8, height: 15, offsetY: 0 }
      const result = renderComplexShape(geo, 100, 100, '#555')
      expect(result).not.toBeNull()
      const rectCount = (result!.match(/<rect/g) || []).length
      expect(rectCount).toBe(6)
    })

    it('uses material fill url when geo.material is set', () => {
      const geo: Geometry = { type: 'radialRects', count: 3, radius: 20, width: 5, height: 10, material: 'steel' }
      const result = renderComplexShape(geo, 0, 0, '#000')!
      expect(result).toContain('url(#grad-steel)')
    })

    it('uses geo.fill when set (no material)', () => {
      const geo: Geometry = { type: 'radialRects', count: 3, radius: 20, width: 5, height: 10, fill: '#f00' }
      const result = renderComplexShape(geo, 0, 0, '#000')!
      expect(result).toContain('fill="#f00"')
    })

    it('uses fallback fill when no material and no geo.fill', () => {
      const geo: Geometry = { type: 'radialRects', count: 2, radius: 10, width: 4, height: 8 }
      const result = renderComplexShape(geo, 0, 0, '#777')!
      expect(result).toContain('fill="#777"')
    })

    it('returns empty string for 0 count', () => {
      const geo: Geometry = { type: 'radialRects', count: 0 }
      expect(renderComplexShape(geo, 0, 0, '#000')).toBe('')
    })
  })

  describe('radialBlades', () => {
    it('renders one rect per blade', () => {
      const geo: Geometry = { type: 'radialBlades', count: 4, radius: 25, width: 6, height: 12, curve: 10, offsetY: 0 }
      const result = renderComplexShape(geo, 100, 100, '#444')
      expect(result).not.toBeNull()
      const rectCount = (result!.match(/<rect/g) || []).length
      expect(rectCount).toBe(4)
    })

    it('includes rotation transform with curve offset', () => {
      const geo: Geometry = { type: 'radialBlades', count: 2, radius: 20, width: 5, height: 10, curve: 15 }
      const result = renderComplexShape(geo, 0, 0, '#000')!
      expect(result).toContain('transform="rotate(')
    })

    it('returns empty string for 0 blades', () => {
      const geo: Geometry = { type: 'radialBlades', count: 0 }
      expect(renderComplexShape(geo, 0, 0, '#000')).toBe('')
    })
  })

  describe('unknown type', () => {
    it('returns null for unknown shape type', () => {
      const geo: Geometry = { type: 'totally-unknown' }
      const result = renderComplexShape(geo, 0, 0, '#000')
      expect(result).toBeNull()
    })
  })
})
