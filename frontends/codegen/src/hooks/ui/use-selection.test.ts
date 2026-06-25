import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelection } from './use-selection'

type Item = { id: string }

describe('useSelection (ui)', () => {
  it('starts with no selection', () => {
    const { result } = renderHook(() => useSelection<Item>())
    expect(result.current.selectedIds).toHaveLength(0)
    expect(result.current.count).toBe(0)
  })

  it('select adds an id', () => {
    const { result } = renderHook(() => useSelection<Item>())
    act(() => { result.current.select('abc') })
    expect(result.current.isSelected('abc')).toBe(true)
    expect(result.current.count).toBe(1)
  })

  it('deselect removes an id', () => {
    const { result } = renderHook(() => useSelection<Item>())
    act(() => { result.current.select('abc') })
    act(() => { result.current.deselect('abc') })
    expect(result.current.isSelected('abc')).toBe(false)
    expect(result.current.count).toBe(0)
  })

  it('toggle selects then deselects', () => {
    const { result } = renderHook(() => useSelection<Item>())
    act(() => { result.current.toggle('abc') })
    expect(result.current.isSelected('abc')).toBe(true)
    act(() => { result.current.toggle('abc') })
    expect(result.current.isSelected('abc')).toBe(false)
  })

  it('selectAll selects all provided items', () => {
    const { result } = renderHook(() => useSelection<Item>())
    act(() => { result.current.selectAll([{ id: '1' }, { id: '2' }, { id: '3' }]) })
    expect(result.current.count).toBe(3)
    expect(result.current.isSelected('2')).toBe(true)
  })

  it('deselectAll clears all selections', () => {
    const { result } = renderHook(() => useSelection<Item>())
    act(() => { result.current.selectAll([{ id: '1' }, { id: '2' }]) })
    act(() => { result.current.deselectAll() })
    expect(result.current.count).toBe(0)
  })

  it('selectedIds returns array of selected id strings', () => {
    const { result } = renderHook(() => useSelection<Item>())
    act(() => { result.current.select('x') })
    act(() => { result.current.select('y') })
    expect(result.current.selectedIds).toContain('x')
    expect(result.current.selectedIds).toContain('y')
  })
})
