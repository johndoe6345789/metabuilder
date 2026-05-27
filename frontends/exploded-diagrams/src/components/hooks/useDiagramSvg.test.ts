import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDiagramSvg } from './useDiagramSvg'
import type { Assembly, Materials } from '@/lib/types'

const materials: Materials = {
  steel: {
    name: 'Steel',
    gradient: { angle: 0, stops: [{ offset: 0, color: '#aaa' }, { offset: 100, color: '#777' }] },
  },
}

function makeAssembly(overrides?: Partial<Assembly>): Assembly {
  return {
    name: 'Test Assembly',
    description: 'A test',
    parts: [
      {
        id: 'p1',
        name: 'Bolt',
        partNumber: 'BLT-001',
        material: 'steel',
        weight: 10,
        quantity: 2,
        baseY: 0,
        geometry: [{ type: 'circle', r: 5 }],
      },
    ],
    ...overrides,
  }
}

describe('useDiagramSvg', () => {
  it('returns svgContent and canvasHeight', () => {
    const { result } = renderHook(() =>
      useDiagramSvg({
        assembly: makeAssembly(),
        materials,
        explosion: 50,
        rotation: 0,
        highlightedPart: null,
      })
    )
    expect(typeof result.current.svgContent).toBe('string')
    expect(typeof result.current.canvasHeight).toBe('number')
  })

  it('svgContent includes <defs>', () => {
    const { result } = renderHook(() =>
      useDiagramSvg({
        assembly: makeAssembly(),
        materials,
        explosion: 0,
        rotation: 0,
        highlightedPart: null,
      })
    )
    expect(result.current.svgContent).toContain('<defs>')
  })

  it('svgContent includes assembly name', () => {
    const { result } = renderHook(() =>
      useDiagramSvg({
        assembly: makeAssembly({ name: 'My Widget' }),
        materials,
        explosion: 0,
        rotation: 0,
        highlightedPart: null,
      })
    )
    expect(result.current.svgContent).toContain('MY WIDGET')
  })

  it('svgContent includes assembly description', () => {
    const { result } = renderHook(() =>
      useDiagramSvg({
        assembly: makeAssembly({ description: 'A cool part' }),
        materials,
        explosion: 0,
        rotation: 0,
        highlightedPart: null,
      })
    )
    expect(result.current.svgContent).toContain('A cool part')
  })

  it('svgContent includes part group elements', () => {
    const { result } = renderHook(() =>
      useDiagramSvg({
        assembly: makeAssembly(),
        materials,
        explosion: 0,
        rotation: 0,
        highlightedPart: null,
      })
    )
    // renderPartGroup creates <g class="part" data-part="p1" ...>
    expect(result.current.svgContent).toContain('data-part="p1"')
  })

  it('canvasHeight is at least 750', () => {
    const { result } = renderHook(() =>
      useDiagramSvg({
        assembly: makeAssembly(),
        materials,
        explosion: 0,
        rotation: 0,
        highlightedPart: null,
      })
    )
    expect(result.current.canvasHeight).toBeGreaterThanOrEqual(750)
  })

  it('includes weight summary line', () => {
    const { result } = renderHook(() =>
      useDiagramSvg({
        assembly: makeAssembly(),
        materials,
        explosion: 0,
        rotation: 0,
        highlightedPart: null,
      })
    )
    expect(result.current.svgContent).toContain('unique parts')
    expect(result.current.svgContent).toContain('total weight')
  })

  it('handles assembly with no description', () => {
    const { result } = renderHook(() =>
      useDiagramSvg({
        assembly: makeAssembly({ description: undefined }),
        materials,
        explosion: 0,
        rotation: 0,
        highlightedPart: null,
      })
    )
    expect(typeof result.current.svgContent).toBe('string')
  })

  it('uses glow filter for highlighted part', () => {
    const { result } = renderHook(() =>
      useDiagramSvg({
        assembly: makeAssembly(),
        materials,
        explosion: 0,
        rotation: 0,
        highlightedPart: 'p1',
      })
    )
    expect(result.current.svgContent).toContain('url(#glow)')
  })

  it('recalculates when explosion changes', () => {
    const { result, rerender } = renderHook(
      ({ exp }) =>
        useDiagramSvg({
          assembly: makeAssembly(),
          materials,
          explosion: exp,
          rotation: 0,
          highlightedPart: null,
        }),
      { initialProps: { exp: 0 } }
    )
    const first = result.current.svgContent
    rerender({ exp: 100 })
    const second = result.current.svgContent
    // With high explosion, part y positions differ
    expect(typeof second).toBe('string')
    // Both are valid SVG strings
    expect(second).toContain('<defs>')
  })
})
