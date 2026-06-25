import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelectedPart } from './useSelectedPart'
import type { Part } from '@/lib/types'

function makePart(id: string, name?: string): Part {
  return {
    id,
    name: name || `Part ${id}`,
    partNumber: `PN-${id}`,
    material: 'steel',
    weight: 10,
    quantity: 1,
    baseY: 0,
    geometry: [],
  }
}

describe('useSelectedPart', () => {
  describe('initial state', () => {
    it('selects first part by default when parts are non-empty', () => {
      const parts = [makePart('p1'), makePart('p2')]
      const { result } = renderHook(() => useSelectedPart(parts))
      expect(result.current.selectedPartId).toBe('p1')
      expect(result.current.selectedPart).toEqual(parts[0])
    })

    it('selects null when parts array is empty', () => {
      const { result } = renderHook(() => useSelectedPart([]))
      expect(result.current.selectedPartId).toBeNull()
      expect(result.current.selectedPart).toBeNull()
    })
  })

  describe('handleSelectPart', () => {
    it('updates selectedPartId when a part is selected', () => {
      const parts = [makePart('p1'), makePart('p2'), makePart('p3')]
      const { result } = renderHook(() => useSelectedPart(parts))
      act(() => result.current.handleSelectPart('p3'))
      expect(result.current.selectedPartId).toBe('p3')
    })

    it('updates selectedPart to the matching part object', () => {
      const parts = [makePart('p1'), makePart('p2')]
      const { result } = renderHook(() => useSelectedPart(parts))
      act(() => result.current.handleSelectPart('p2'))
      expect(result.current.selectedPart).toEqual(parts[1])
    })

    it('returns null for selectedPart when id does not match any part', () => {
      const parts = [makePart('p1')]
      const { result } = renderHook(() => useSelectedPart(parts))
      act(() => result.current.handleSelectPart('nonexistent'))
      expect(result.current.selectedPart).toBeNull()
    })

    it('can deselect by selecting a non-existent id', () => {
      const parts = [makePart('p1'), makePart('p2')]
      const { result } = renderHook(() => useSelectedPart(parts))
      act(() => result.current.handleSelectPart('no-such-id'))
      expect(result.current.selectedPartId).toBe('no-such-id')
      expect(result.current.selectedPart).toBeNull()
    })
  })

  describe('selectedPart memo', () => {
    it('finds selected part after re-render with same parts', () => {
      const parts = [makePart('p1'), makePart('p2')]
      const { result, rerender } = renderHook(({ ps }) => useSelectedPart(ps), {
        initialProps: { ps: parts },
      })
      act(() => result.current.handleSelectPart('p2'))
      rerender({ ps: parts })
      expect(result.current.selectedPart?.id).toBe('p2')
    })

    it('returns null when selected id is no longer in updated parts list', () => {
      const parts = [makePart('p1'), makePart('p2')]
      const { result, rerender } = renderHook(({ ps }) => useSelectedPart(ps), {
        initialProps: { ps: parts },
      })
      act(() => result.current.handleSelectPart('p2'))
      // Remove p2 from parts
      rerender({ ps: [makePart('p1')] })
      expect(result.current.selectedPart).toBeNull()
    })
  })
})
