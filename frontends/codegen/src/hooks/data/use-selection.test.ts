import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelection } from './use-selection'

type Item = { id: string; label: string }

const items: Item[] = [
  { id: '1', label: 'A' },
  { id: '2', label: 'B' },
  { id: '3', label: 'C' },
]

describe('useSelection (data)', () => {
  it('starts with no selection', () => {
    const { result } = renderHook(() => useSelection({ items }))
    expect(result.current.selected.size).toBe(0)
    expect(result.current.hasSelection).toBe(false)
  })

  it('toggle selects an item', () => {
    const { result } = renderHook(() => useSelection({ items }))
    act(() => { result.current.toggle('1') })
    expect(result.current.isSelected('1')).toBe(true)
    expect(result.current.count).toBe(1)
  })

  it('toggle deselects an already selected item', () => {
    const { result } = renderHook(() => useSelection({ items }))
    act(() => { result.current.toggle('1') })
    act(() => { result.current.toggle('1') })
    expect(result.current.isSelected('1')).toBe(false)
  })

  it('single mode: selecting one deselects others', () => {
    const { result } = renderHook(() => useSelection({ items, multiple: false }))
    act(() => { result.current.toggle('1') })
    act(() => { result.current.toggle('2') })
    expect(result.current.isSelected('1')).toBe(false)
    expect(result.current.isSelected('2')).toBe(true)
    expect(result.current.count).toBe(1)
  })

  it('multiple mode allows selecting multiple items', () => {
    const { result } = renderHook(() => useSelection({ items, multiple: true }))
    act(() => { result.current.toggle('1') })
    act(() => { result.current.toggle('2') })
    expect(result.current.count).toBe(2)
    expect(result.current.isSelected('1')).toBe(true)
    expect(result.current.isSelected('2')).toBe(true)
  })

  it('select adds id without clearing others in multiple mode', () => {
    const { result } = renderHook(() => useSelection({ items, multiple: true }))
    act(() => { result.current.select('1') })
    act(() => { result.current.select('3') })
    expect(result.current.count).toBe(2)
  })

  it('select replaces selection in single mode', () => {
    const { result } = renderHook(() => useSelection({ items, multiple: false }))
    act(() => { result.current.select('1') })
    act(() => { result.current.select('2') })
    expect(result.current.count).toBe(1)
    expect(result.current.isSelected('2')).toBe(true)
  })

  it('deselect removes a specific id', () => {
    const { result } = renderHook(() => useSelection({ items, multiple: true }))
    act(() => { result.current.select('1') })
    act(() => { result.current.select('2') })
    act(() => { result.current.deselect('1') })
    expect(result.current.isSelected('1')).toBe(false)
    expect(result.current.isSelected('2')).toBe(true)
  })

  it('selectAll selects all items (multiple mode)', () => {
    const { result } = renderHook(() => useSelection({ items, multiple: true }))
    act(() => { result.current.selectAll() })
    expect(result.current.count).toBe(3)
  })

  it('deselectAll clears selection', () => {
    const { result } = renderHook(() => useSelection({ items, multiple: true }))
    act(() => { result.current.selectAll() })
    act(() => { result.current.deselectAll() })
    expect(result.current.count).toBe(0)
    expect(result.current.hasSelection).toBe(false)
  })

  it('getSelected returns the selected item objects', () => {
    const { result } = renderHook(() => useSelection({ items, multiple: true }))
    act(() => { result.current.select('1') })
    act(() => { result.current.select('3') })
    const selected = result.current.getSelected()
    expect(selected).toHaveLength(2)
    expect(selected.map(i => i.id)).toContain('1')
    expect(selected.map(i => i.id)).toContain('3')
  })
})
