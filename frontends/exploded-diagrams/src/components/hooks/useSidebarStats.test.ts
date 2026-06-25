import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSidebarStats } from './useSidebarStats'
import type { Assembly } from '@/lib/types'

function makeAssembly(parts: Assembly['parts'] = []): Assembly {
  return { name: 'Test Assembly', parts }
}

describe('useSidebarStats', () => {
  it('returns zero counts for empty assembly', () => {
    const { result } = renderHook(() => useSidebarStats(makeAssembly()))
    expect(result.current.totalParts).toBe(0)
    expect(result.current.totalWeight).toBe(0)
    expect(result.current.uniqueMaterials).toEqual([])
  })

  it('sums quantity across all parts', () => {
    const assembly = makeAssembly([
      { id: '1', name: 'A', partNumber: 'P1', material: 'steel', weight: 10, quantity: 3, baseY: 0, geometry: [] },
      { id: '2', name: 'B', partNumber: 'P2', material: 'rubber', weight: 5, quantity: 2, baseY: 0, geometry: [] },
    ])
    const { result } = renderHook(() => useSidebarStats(assembly))
    expect(result.current.totalParts).toBe(5)  // 3 + 2
  })

  it('computes total weight as weight * quantity', () => {
    const assembly = makeAssembly([
      { id: '1', name: 'A', partNumber: 'P1', material: 'steel', weight: 100, quantity: 2, baseY: 0, geometry: [] },
      { id: '2', name: 'B', partNumber: 'P2', material: 'rubber', weight: 50, quantity: 3, baseY: 0, geometry: [] },
    ])
    const { result } = renderHook(() => useSidebarStats(assembly))
    expect(result.current.totalWeight).toBe(350) // 200 + 150
  })

  it('deduplicates materials', () => {
    const assembly = makeAssembly([
      { id: '1', name: 'A', partNumber: 'P1', material: 'steel', weight: 10, quantity: 1, baseY: 0, geometry: [] },
      { id: '2', name: 'B', partNumber: 'P2', material: 'steel', weight: 5, quantity: 1, baseY: 0, geometry: [] },
      { id: '3', name: 'C', partNumber: 'P3', material: 'rubber', weight: 8, quantity: 1, baseY: 0, geometry: [] },
    ])
    const { result } = renderHook(() => useSidebarStats(assembly))
    expect(result.current.uniqueMaterials).toHaveLength(2)
    expect(result.current.uniqueMaterials).toContain('steel')
    expect(result.current.uniqueMaterials).toContain('rubber')
  })

  it('shows weight in grams when below 1000g', () => {
    const assembly = makeAssembly([
      { id: '1', name: 'A', partNumber: 'P1', material: 'steel', weight: 500, quantity: 1, baseY: 0, geometry: [] },
    ])
    const { result } = renderHook(() => useSidebarStats(assembly))
    expect(result.current.weightLabel).toBe('500g')
  })

  it('shows weight in kg when 1000g or above', () => {
    const assembly = makeAssembly([
      { id: '1', name: 'A', partNumber: 'P1', material: 'steel', weight: 1500, quantity: 1, baseY: 0, geometry: [] },
    ])
    const { result } = renderHook(() => useSidebarStats(assembly))
    expect(result.current.weightLabel).toBe('1.50kg')
  })

  it('shows weight in kg exactly at 1000g boundary', () => {
    const assembly = makeAssembly([
      { id: '1', name: 'A', partNumber: 'P1', material: 'steel', weight: 1000, quantity: 1, baseY: 0, geometry: [] },
    ])
    const { result } = renderHook(() => useSidebarStats(assembly))
    expect(result.current.weightLabel).toBe('1.00kg')
  })

  it('recomputes when assembly changes', () => {
    let assembly = makeAssembly([
      { id: '1', name: 'A', partNumber: 'P1', material: 'steel', weight: 10, quantity: 2, baseY: 0, geometry: [] },
    ])
    const { result, rerender } = renderHook(({ asm }) => useSidebarStats(asm), {
      initialProps: { asm: assembly },
    })
    expect(result.current.totalParts).toBe(2)

    assembly = makeAssembly([
      { id: '1', name: 'A', partNumber: 'P1', material: 'steel', weight: 10, quantity: 5, baseY: 0, geometry: [] },
    ])
    rerender({ asm: assembly })
    expect(result.current.totalParts).toBe(5)
  })
})
