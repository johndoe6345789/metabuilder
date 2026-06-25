import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTabs } from './use-tabs'

describe('useTabs', () => {
  it('starts on the default tab', () => {
    const { result } = renderHook(() => useTabs('home'))
    expect(result.current.activeTab).toBe('home')
  })

  it('switches to a new tab via switchTab', () => {
    const { result } = renderHook(() => useTabs('home'))
    act(() => { result.current.switchTab('settings') })
    expect(result.current.activeTab).toBe('settings')
  })

  it('isActive returns true for the active tab', () => {
    const { result } = renderHook(() => useTabs<'a' | 'b'>('a'))
    expect(result.current.isActive('a')).toBe(true)
    expect(result.current.isActive('b')).toBe(false)
  })

  it('isActive updates after switchTab', () => {
    const { result } = renderHook(() => useTabs<'a' | 'b'>('a'))
    act(() => { result.current.switchTab('b') })
    expect(result.current.isActive('b')).toBe(true)
    expect(result.current.isActive('a')).toBe(false)
  })

  it('setActiveTab directly updates the active tab', () => {
    const { result } = renderHook(() => useTabs('first'))
    act(() => { result.current.setActiveTab('second') })
    expect(result.current.activeTab).toBe('second')
  })
})
