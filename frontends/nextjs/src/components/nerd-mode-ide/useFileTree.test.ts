import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useFileTree } from './useFileTree'

beforeEach(() => {
  localStorage.clear()
})

describe('useFileTree', () => {
  it('loads the default tree when nothing is stored', () => {
    const { result } = renderHook(() => useFileTree())
    expect(result.current.tree).toEqual([
      {
        name: 'src',
        type: 'folder',
        children: [
          { name: 'workflow.json', type: 'file', language: 'json' },
          { name: 'config.json', type: 'file', language: 'json' },
          { name: 'styles.css', type: 'file', language: 'css' },
        ],
      },
    ])
  })

  it('loads a stored tree when present', () => {
    const custom = [{ name: 'a', type: 'file', language: 'text' }]
    localStorage.setItem('ide-file-tree', JSON.stringify(custom))
    const { result } = renderHook(() => useFileTree())
    expect(result.current.tree).toEqual(custom)
  })

  it('falls back to the default tree on malformed storage', () => {
    localStorage.setItem('ide-file-tree', '{not json')
    const { result } = renderHook(() => useFileTree())
    expect(result.current.tree[0].name).toBe('src')
  })

  it('starts with no open file and "src" expanded', () => {
    const { result } = renderHook(() => useFileTree())
    expect(result.current.openFile).toBeNull()
    expect(result.current.expandedPaths.has('src')).toBe(true)
  })

  it('openFileNode opens a file with empty content', () => {
    const { result } = renderHook(() => useFileTree())
    act(() => result.current.openFileNode('src/workflow.json', 'json'))
    expect(result.current.openFile).toEqual({
      path: 'src/workflow.json',
      language: 'json',
      content: '',
    })
  })

  it('toggleExpand collapses an expanded path', () => {
    const { result } = renderHook(() => useFileTree())
    act(() => result.current.toggleExpand('src'))
    expect(result.current.expandedPaths.has('src')).toBe(false)
  })

  it('toggleExpand expands a collapsed path', () => {
    const { result } = renderHook(() => useFileTree())
    act(() => result.current.toggleExpand('src/nested'))
    expect(result.current.expandedPaths.has('src/nested')).toBe(true)
  })
})
