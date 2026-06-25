import { describe, it, expect, vi } from 'vitest'
import { renderShape } from './svgShapes'
import type { Geometry } from '@/lib/types'

describe('renderShape', () => {
  it('delegates to renderSimpleShape for circle', () => {
    const geo: Geometry = { type: 'circle', r: 10 }
    const result = renderShape(geo, 100, 100, '#f00')
    expect(result).toContain('<circle')
  })

  it('delegates to renderComplexShape for cylinder', () => {
    const geo: Geometry = { type: 'cylinder', rx: 10, ry: 5, height: 30 }
    const result = renderShape(geo, 100, 100, '#aaa')
    expect(result).toContain('<ellipse')
  })

  it('returns empty string for completely unknown type (with console.warn)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const geo: Geometry = { type: 'totally-unknown-xyz' }
    const result = renderShape(geo, 0, 0, '#000')
    expect(result).toBe('')
    expect(warnSpy).toHaveBeenCalledWith('Unknown geometry type: totally-unknown-xyz')
    warnSpy.mockRestore()
  })

  it('handles all simple shape types', () => {
    const types: Geometry[] = [
      { type: 'ellipse', rx: 10, ry: 5 },
      { type: 'rect', width: 20, height: 10 },
      { type: 'line', stroke: '#000', strokeWidth: 1 },
      { type: 'polygon', points: [0, 0, 10, 0, 5, 10] },
      { type: 'text', content: 'Label' },
    ]
    for (const geo of types) {
      const result = renderShape(geo, 50, 50, '#000')
      expect(typeof result).toBe('string')
    }
  })

  it('handles all complex shape types', () => {
    const types: Geometry[] = [
      { type: 'cone', topRx: 5, bottomRx: 15, height: 30 },
      { type: 'coilSpring', coils: 3, rx: 10, ry: 4, pitch: 8 },
      { type: 'gearRing', teeth: 6, outerRadius: 20, toothHeight: 4 },
      { type: 'radialRects', count: 4, radius: 20, width: 5, height: 10 },
      { type: 'radialBlades', count: 3, radius: 15, width: 4, height: 8, curve: 5 },
    ]
    for (const geo of types) {
      const result = renderShape(geo, 50, 50, '#aaa')
      expect(typeof result).toBe('string')
    }
  })
})
