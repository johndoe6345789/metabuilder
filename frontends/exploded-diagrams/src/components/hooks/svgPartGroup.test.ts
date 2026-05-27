import { describe, it, expect, vi } from 'vitest'
import { renderPartGroup } from './svgPartGroup'
import type { Part, Geometry } from '@/lib/types'
import type { PositionedPart } from '@/lib/collision'

function makePart(overrides?: Partial<Part>): Part {
  return {
    id: 'part-1',
    name: 'Screw',
    partNumber: 'SCR-001',
    material: 'steel',
    weight: 5,
    quantity: 4,
    baseY: 0,
    geometry: [],
    ...overrides,
  }
}

function makePositioned(part: Part, y = 100): PositionedPart {
  return {
    part,
    y,
    bbox: { minX: 80, minY: 80, maxX: 120, maxY: 120, width: 40, height: 40 },
  }
}

describe('renderPartGroup', () => {
  const renderGeometry = vi.fn((_geo: Geometry, _cx: number, _cy: number, _mat: string) => '<circle/>')

  beforeEach(() => renderGeometry.mockClear())

  it('renders a <g> group element with part id', () => {
    const positioned = makePositioned(makePart())
    const result = renderPartGroup(positioned, 0, null, 0, 350, renderGeometry)
    expect(result).toContain('<g')
    expect(result).toContain('data-part="part-1"')
    expect(result).toContain('style="cursor:pointer"')
  })

  it('uses dropShadow filter when part is not highlighted', () => {
    const positioned = makePositioned(makePart())
    const result = renderPartGroup(positioned, 0, null, 0, 350, renderGeometry)
    expect(result).toContain('url(#dropShadow)')
  })

  it('uses glow filter when part is highlighted', () => {
    const part = makePart({ id: 'glow-part' })
    const positioned = makePositioned(part)
    const result = renderPartGroup(positioned, 0, 'glow-part', 0, 350, renderGeometry)
    expect(result).toContain('url(#glow)')
  })

  it('applies rotation transform when rotation !== 0', () => {
    const positioned = makePositioned(makePart())
    const result = renderPartGroup(positioned, 0, null, 45, 350, renderGeometry)
    expect(result).toContain('transform="rotate(45, 350, 100)"')
  })

  it('omits rotation transform when rotation === 0', () => {
    const positioned = makePositioned(makePart())
    const result = renderPartGroup(positioned, 0, null, 0, 350, renderGeometry)
    expect(result).not.toContain('transform=')
  })

  it('calls renderGeometry for each geometry item', () => {
    const geo1: Geometry = { type: 'circle', r: 5 }
    const geo2: Geometry = { type: 'rect', width: 10, height: 10 }
    const part = makePart({ geometry: [geo1, geo2] })
    const positioned = makePositioned(part)
    renderPartGroup(positioned, 0, null, 0, 350, renderGeometry)
    expect(renderGeometry).toHaveBeenCalledTimes(2)
    expect(renderGeometry).toHaveBeenCalledWith(geo1, 350, 100, 'steel')
    expect(renderGeometry).toHaveBeenCalledWith(geo2, 350, 100, 'steel')
  })

  it('renders part name label', () => {
    const positioned = makePositioned(makePart({ name: 'Main Bolt' }))
    const result = renderPartGroup(positioned, 0, null, 0, 350, renderGeometry)
    expect(result).toContain('Main Bolt')
  })

  it('renders part number label', () => {
    const positioned = makePositioned(makePart({ partNumber: 'BOLT-42' }))
    const result = renderPartGroup(positioned, 0, null, 0, 350, renderGeometry)
    expect(result).toContain('BOLT-42')
  })

  it('renders connector line and circle', () => {
    const positioned = makePositioned(makePart())
    const result = renderPartGroup(positioned, 0, null, 0, 350, renderGeometry)
    expect(result).toContain('<line')
    expect(result).toContain('<circle')
  })

  it('places label on right side for even index', () => {
    const positioned = makePositioned(makePart())
    const result = renderPartGroup(positioned, 0, null, 0, 350, renderGeometry)
    // Even index → side=1 → labelX = centerX + 180 = 530 → text-anchor="start"
    expect(result).toContain('text-anchor="start"')
  })

  it('places label on left side for odd index', () => {
    const positioned = makePositioned(makePart())
    const result = renderPartGroup(positioned, 1, null, 0, 350, renderGeometry)
    // Odd index → side=-1 → text-anchor="end"
    expect(result).toContain('text-anchor="end"')
  })

  it('does not call renderGeometry when geometry is empty', () => {
    const positioned = makePositioned(makePart({ geometry: [] }))
    renderPartGroup(positioned, 0, null, 0, 350, renderGeometry)
    expect(renderGeometry).not.toHaveBeenCalled()
  })
})
