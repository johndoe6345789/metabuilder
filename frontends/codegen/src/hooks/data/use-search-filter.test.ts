import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSearchFilter } from './use-search-filter'

type Item = { id: string; name: string; type: string }

const items: Item[] = [
  { id: '1', name: 'Button', type: 'atom' },
  { id: '2', name: 'Badge', type: 'atom' },
  { id: '3', name: 'Card', type: 'molecule' },
  { id: '4', name: 'Navbar', type: 'organism' },
]

describe('useSearchFilter', () => {
  it('returns all items when query is empty', () => {
    const { result } = renderHook(() =>
      useSearchFilter({ items, searchFields: ['name'] })
    )
    expect(result.current.filtered).toHaveLength(4)
    expect(result.current.total).toBe(4)
  })

  it('filters by search query on specified field', () => {
    const { result } = renderHook(() =>
      useSearchFilter({ items, searchFields: ['name'] })
    )
    act(() => { result.current.setSearchQuery('ba') })
    // "Badge" matches, "Navbar" matches
    expect(result.current.filtered.map(i => i.id)).toContain('2')
    expect(result.current.filtered.map(i => i.id)).toContain('4')
    expect(result.current.filtered).not.toContain(items.find(i => i.id === '1'))
  })

  it('is case-insensitive', () => {
    const { result } = renderHook(() =>
      useSearchFilter({ items, searchFields: ['name'] })
    )
    act(() => { result.current.setSearchQuery('BUTTON') })
    expect(result.current.filtered).toHaveLength(1)
    expect(result.current.filtered[0].id).toBe('1')
  })

  it('uses custom filterFn when filters are set', () => {
    const { result } = renderHook(() =>
      useSearchFilter({
        items,
        searchFields: [],
        filterFn: (item, filters) => item.type === filters.type,
      })
    )
    act(() => { result.current.setFilter('type', 'atom') })
    expect(result.current.filtered).toHaveLength(2)
    expect(result.current.filtered.every(i => i.type === 'atom')).toBe(true)
  })

  it('clearFilters resets query and filters', () => {
    const { result } = renderHook(() =>
      useSearchFilter({ items, searchFields: ['name'] })
    )
    act(() => { result.current.setSearchQuery('button') })
    act(() => { result.current.clearFilters() })
    expect(result.current.filtered).toHaveLength(4)
    expect(result.current.searchQuery).toBe('')
  })

  it('count equals filtered items length', () => {
    const { result } = renderHook(() =>
      useSearchFilter({ items, searchFields: ['name'] })
    )
    act(() => { result.current.setSearchQuery('card') })
    expect(result.current.count).toBe(result.current.filtered.length)
  })

  it('searches across multiple fields', () => {
    const { result } = renderHook(() =>
      useSearchFilter({ items, searchFields: ['name', 'type'] })
    )
    act(() => { result.current.setSearchQuery('molecule') })
    expect(result.current.filtered).toHaveLength(1)
    expect(result.current.filtered[0].id).toBe('3')
  })
})
