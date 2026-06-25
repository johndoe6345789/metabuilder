import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useListOperations } from './use-list-operations'

type Item = { id: string; name: string }

function makeItem(id: string, name = `Item ${id}`): Item {
  return { id, name }
}

describe('useListOperations', () => {
  it('initialises with provided items', () => {
    const initial = [makeItem('1'), makeItem('2')]
    const { result } = renderHook(() => useListOperations({ initialItems: initial }))
    expect(result.current.items).toHaveLength(2)
    expect(result.current.isEmpty).toBe(false)
  })

  it('initialises empty by default', () => {
    const { result } = renderHook(() => useListOperations())
    expect(result.current.items).toHaveLength(0)
    expect(result.current.isEmpty).toBe(true)
  })

  it('addItem appends to the end by default', () => {
    const { result } = renderHook(() => useListOperations({ initialItems: [makeItem('1')] }))
    act(() => { result.current.addItem(makeItem('2')) })
    expect(result.current.items[1].id).toBe('2')
  })

  it('addItem inserts at a given position', () => {
    const { result } = renderHook(() =>
      useListOperations({ initialItems: [makeItem('1'), makeItem('3')] })
    )
    act(() => { result.current.addItem(makeItem('2'), 1) })
    expect(result.current.items[1].id).toBe('2')
    expect(result.current.items[2].id).toBe('3')
  })

  it('updateItem updates by id with partial object', () => {
    const { result } = renderHook(() =>
      useListOperations({ initialItems: [makeItem('1', 'Original')] })
    )
    act(() => { result.current.updateItem('1', { name: 'Updated' }) })
    expect(result.current.items[0].name).toBe('Updated')
  })

  it('updateItem supports updater function', () => {
    const { result } = renderHook(() =>
      useListOperations({ initialItems: [makeItem('1', 'foo')] })
    )
    act(() => { result.current.updateItem('1', (item) => ({ ...item, name: item.name.toUpperCase() })) })
    expect(result.current.items[0].name).toBe('FOO')
  })

  it('removeItem removes by id', () => {
    const { result } = renderHook(() =>
      useListOperations({ initialItems: [makeItem('1'), makeItem('2')] })
    )
    act(() => { result.current.removeItem('1') })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('2')
  })

  it('removeItems removes multiple ids', () => {
    const { result } = renderHook(() =>
      useListOperations({ initialItems: [makeItem('1'), makeItem('2'), makeItem('3')] })
    )
    act(() => { result.current.removeItems(['1', '3']) })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('2')
  })

  it('moveItem moves an item from one index to another', () => {
    const { result } = renderHook(() =>
      useListOperations({ initialItems: [makeItem('1'), makeItem('2'), makeItem('3')] })
    )
    act(() => { result.current.moveItem(0, 2) })
    expect(result.current.items[0].id).toBe('2')
    expect(result.current.items[2].id).toBe('1')
  })

  it('moveItem is a no-op for out-of-range indices', () => {
    const initial = [makeItem('1'), makeItem('2')]
    const { result } = renderHook(() => useListOperations({ initialItems: initial }))
    act(() => { result.current.moveItem(0, 10) })
    expect(result.current.items.map(i => i.id)).toEqual(['1', '2'])
  })

  it('toggleSelection selects and deselects', () => {
    const { result } = renderHook(() =>
      useListOperations({ initialItems: [makeItem('1')] })
    )
    act(() => { result.current.toggleSelection('1') })
    expect(result.current.selectedIds).toContain('1')
    expect(result.current.selectedCount).toBe(1)

    act(() => { result.current.toggleSelection('1') })
    expect(result.current.selectedIds).not.toContain('1')
    expect(result.current.selectedCount).toBe(0)
  })

  it('selectAll selects all items', () => {
    const { result } = renderHook(() =>
      useListOperations({ initialItems: [makeItem('1'), makeItem('2')] })
    )
    act(() => { result.current.selectAll() })
    expect(result.current.selectedCount).toBe(2)
  })

  it('clearSelection deselects all', () => {
    const { result } = renderHook(() =>
      useListOperations({ initialItems: [makeItem('1')] })
    )
    act(() => { result.current.toggleSelection('1') })
    act(() => { result.current.clearSelection() })
    expect(result.current.selectedCount).toBe(0)
  })

  it('removeSelected removes all selected items', () => {
    const { result } = renderHook(() =>
      useListOperations({ initialItems: [makeItem('1'), makeItem('2')] })
    )
    act(() => { result.current.toggleSelection('1') })
    act(() => { result.current.removeSelected() })
    expect(result.current.items.map(i => i.id)).toEqual(['2'])
  })

  it('findById returns the item or undefined', () => {
    const { result } = renderHook(() =>
      useListOperations({ initialItems: [makeItem('1', 'Alpha')] })
    )
    expect(result.current.findById('1')?.name).toBe('Alpha')
    expect(result.current.findById('99')).toBeUndefined()
  })

  it('clear removes all items and selections', () => {
    const { result } = renderHook(() =>
      useListOperations({ initialItems: [makeItem('1'), makeItem('2')] })
    )
    act(() => { result.current.toggleSelection('1') })
    act(() => { result.current.clear() })
    expect(result.current.items).toHaveLength(0)
    expect(result.current.selectedCount).toBe(0)
  })

  it('calls onItemsChange callback when items change', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useListOperations({ onItemsChange: onChange })
    )
    act(() => { result.current.addItem(makeItem('1')) })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith([makeItem('1')])
  })
})
