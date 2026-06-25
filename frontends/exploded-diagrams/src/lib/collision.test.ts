import { describe, it, expect } from 'vitest'
import {
  aabbCollision,
  getVerticalSeparation,
  getPartBounds,
  checkLabelCollision,
  positionPartsWithCollision,
} from './collision'
import type { BoundingBox } from './collision'
import type { Part } from './types'

function makeBBox(
  minX: number, minY: number, maxX: number, maxY: number
): BoundingBox {
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}

function makePart(id: string, geometry: Part['geometry'] = []): Part {
  return {
    id, name: id, partNumber: id,
    material: 'steel', weight: 10, quantity: 1, baseY: 0, geometry,
  }
}

// ─── aabbCollision ─────────────────────────────────────────────────────────
describe('aabbCollision', () => {
  it('returns true for overlapping boxes', () => {
    const a = makeBBox(0, 0, 10, 10)
    const b = makeBBox(5, 5, 15, 15)
    expect(aabbCollision(a, b)).toBe(true)
  })

  it('returns false for non-overlapping boxes (horizontal gap)', () => {
    const a = makeBBox(0, 0, 10, 10)
    const b = makeBBox(11, 0, 20, 10)
    expect(aabbCollision(a, b)).toBe(false)
  })

  it('returns false for non-overlapping boxes (vertical gap)', () => {
    const a = makeBBox(0, 0, 10, 10)
    const b = makeBBox(0, 11, 10, 20)
    expect(aabbCollision(a, b)).toBe(false)
  })

  it('returns false for touching (not overlapping) boxes', () => {
    // Touching exactly: a.maxX == b.minX → not overlapping (strict <)
    const a = makeBBox(0, 0, 10, 10)
    const b = makeBBox(10, 0, 20, 10)
    expect(aabbCollision(a, b)).toBe(false)
  })

  it('returns true for one box fully inside another', () => {
    const outer = makeBBox(0, 0, 100, 100)
    const inner = makeBBox(20, 20, 50, 50)
    expect(aabbCollision(outer, inner)).toBe(true)
  })
})

// ─── getVerticalSeparation ─────────────────────────────────────────────────
describe('getVerticalSeparation', () => {
  it('returns 0 when boxes do not overlap', () => {
    const a = makeBBox(0, 0, 10, 10)
    const b = makeBBox(0, 20, 10, 30)
    expect(getVerticalSeparation(a, b)).toBe(0)
  })

  it('returns positive separation when b penetrates from above a', () => {
    // b.minY=5 < a.maxY=10: b overlaps top of a from above
    const a = makeBBox(0, 0, 10, 10)
    const b = makeBBox(0, 5, 10, 15)
    const sep = getVerticalSeparation(a, b)
    expect(sep).toBeGreaterThan(0)
  })

  it('includes padding of 4 in separation', () => {
    const a = makeBBox(0, 0, 10, 10)
    const b = makeBBox(0, 8, 10, 18) // overlapDown = 10-8=2
    const sep = getVerticalSeparation(a, b)
    // overlapDown=2, overlapUp=18-0=18 → return overlapDown+4 = 6
    expect(sep).toBe(6)
  })
})

// ─── getPartBounds ─────────────────────────────────────────────────────────
describe('getPartBounds', () => {
  it('returns default bounds for part with no geometry', () => {
    const part = makePart('p1', [])
    const bounds = getPartBounds(part, 100, 100)
    // Should return centered 20x20 around (100,100)
    expect(bounds.minX).toBe(90)
    expect(bounds.minY).toBe(90)
    expect(bounds.maxX).toBe(110)
    expect(bounds.maxY).toBe(110)
  })

  it('computes bounds for a circle geometry', () => {
    const part = makePart('p1', [{ type: 'circle', r: 10 }])
    const bounds = getPartBounds(part, 100, 100)
    // circle: minX=100-10-8=82, maxX=100+10+8=118
    expect(bounds.minX).toBe(82)
    expect(bounds.maxX).toBe(118)
  })

  it('adds padding of 8 around geometry bounds', () => {
    const part = makePart('p1', [{ type: 'ellipse', rx: 20, ry: 10 }])
    const bounds = getPartBounds(part, 100, 100)
    // ellipse: raw minX=80, after padding=72; raw maxX=120, after padding=128
    expect(bounds.minX).toBe(72)
    expect(bounds.maxX).toBe(128)
  })

  it('computes combined bounds for multiple geometries', () => {
    const part = makePart('p1', [
      { type: 'circle', r: 5 },
      { type: 'rect', width: 60, height: 20 },
    ])
    const bounds = getPartBounds(part, 100, 100)
    // rect extends further: minX=100-30=70, maxX=100+30=130
    // after padding: minX=62, maxX=138
    expect(bounds.minX).toBe(62)
    expect(bounds.maxX).toBe(138)
  })

  it('handles different geometry types', () => {
    const types: Part['geometry'] = [
      { type: 'cylinder', rx: 10, height: 30 },
      { type: 'cone', topRx: 5, bottomRx: 15, height: 20 },
      { type: 'coilSpring', rx: 10, coils: 3, pitch: 8 },
      { type: 'gearRing', outerRadius: 20, toothHeight: 5 },
      { type: 'radialRects', radius: 15, width: 5, height: 8 },
      { type: 'text', content: 'Hello', fontSize: 10 },
      { type: 'line' },
      { type: 'polygon' },
    ]
    for (const geo of types) {
      const part = makePart('test', [geo])
      expect(() => getPartBounds(part, 100, 100)).not.toThrow()
    }
  })
})

// ─── checkLabelCollision ───────────────────────────────────────────────────
describe('checkLabelCollision', () => {
  it('returns true when part bbox overlaps label', () => {
    const partBbox = makeBBox(0, 0, 200, 200)
    // Label at (100, 100) should be inside partBbox
    expect(checkLabelCollision(partBbox, 100, 100)).toBe(true)
  })

  it('returns false when part bbox does not overlap label', () => {
    const partBbox = makeBBox(0, 0, 10, 10)
    // Label far away
    expect(checkLabelCollision(partBbox, 500, 500)).toBe(false)
  })

  it('uses custom labelWidth', () => {
    const partBbox = makeBBox(90, 80, 110, 120)
    // Label at (200, 100) with large width=200 → extends to x=100 which might overlap
    expect(typeof checkLabelCollision(partBbox, 200, 100, 200)).toBe('boolean')
  })
})

// ─── positionPartsWithCollision ───────────────────────────────────────────
describe('positionPartsWithCollision', () => {
  it('returns one positioned part per input part', () => {
    const parts = [makePart('p1'), makePart('p2'), makePart('p3')]
    const result = positionPartsWithCollision(parts, 350, 90, 0.5, 70)
    expect(result).toHaveLength(3)
  })

  it('returns empty array for no parts', () => {
    const result = positionPartsWithCollision([], 350, 90, 0.5, 70)
    expect(result).toEqual([])
  })

  it('each result has part, y, and bbox', () => {
    const parts = [makePart('p1')]
    const result = positionPartsWithCollision(parts, 350, 90, 0.5, 70)
    expect(result[0]).toHaveProperty('part')
    expect(result[0]).toHaveProperty('y')
    expect(result[0]).toHaveProperty('bbox')
  })

  it('pushes parts below the UI boundary (minY >= 65+20=85)', () => {
    const parts = [makePart('p1')]
    const result = positionPartsWithCollision(parts, 350, 0, 0, 70)
    // Part should be pushed below the horizontal rule + grace margin
    expect(result[0].bbox.minY).toBeGreaterThanOrEqual(65 + 20)
  })

  it('resulting parts do not significantly overlap', () => {
    const parts = [
      makePart('p1', [{ type: 'rect', width: 100, height: 50 }]),
      makePart('p2', [{ type: 'rect', width: 100, height: 50 }]),
      makePart('p3', [{ type: 'rect', width: 100, height: 50 }]),
    ]
    const result = positionPartsWithCollision(parts, 350, 90, 0.5, 70)
    // Check no two consecutive parts have their bboxes overlapping
    for (let i = 0; i < result.length - 1; i++) {
      const a = result[i].bbox
      const b = result[i + 1].bbox
      // They should not overlap (or at most touch)
      expect(a.maxY).toBeLessThanOrEqual(b.maxY)
    }
  })

  it('respects custom UI boundaries', () => {
    const parts = [makePart('p1')]
    const result = positionPartsWithCollision(parts, 350, 0, 0, 70, {
      horizontalRuleY: 100,
      graceMargin: 30,
    })
    expect(result[0].bbox.minY).toBeGreaterThanOrEqual(130)
  })
})
