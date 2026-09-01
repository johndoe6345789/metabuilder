import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useNerdMode } from './useNerdMode'

const KEY = 'nerd-mode-enabled'

beforeEach(() => {
  localStorage.clear()
})

describe('useNerdMode', () => {
  it('starts closed with nothing stored', () => {
    const { result } = renderHook(() => useNerdMode())
    expect(result.current.isOpen).toBe(false)
  })

  it('starts open when localStorage says so', () => {
    localStorage.setItem(KEY, 'true')
    const { result } = renderHook(() => useNerdMode())
    expect(result.current.isOpen).toBe(true)
  })

  it('open() sets isOpen and persists it', () => {
    const { result } = renderHook(() => useNerdMode())
    act(() => result.current.open())
    expect(result.current.isOpen).toBe(true)
    expect(localStorage.getItem(KEY)).toBe('true')
  })

  it('close() clears isOpen and persists it', () => {
    localStorage.setItem(KEY, 'true')
    const { result } = renderHook(() => useNerdMode())
    act(() => result.current.close())
    expect(result.current.isOpen).toBe(false)
    expect(localStorage.getItem(KEY)).toBe('false')
  })

  it('toggle() flips isOpen back and forth, persisting each time', () => {
    const { result } = renderHook(() => useNerdMode())
    act(() => result.current.toggle())
    expect(result.current.isOpen).toBe(true)
    expect(localStorage.getItem(KEY)).toBe('true')

    act(() => result.current.toggle())
    expect(result.current.isOpen).toBe(false)
    expect(localStorage.getItem(KEY)).toBe('false')
  })
})
