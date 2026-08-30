import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useConfigUi } from './use-config-ui'

describe('useConfigUi', () => {
  it('starts with everything blank and nothing selected', () => {
    const { result } = renderHook(() => useConfigUi())
    expect(result.current.newListName).toBe('')
    expect(result.current.selectedId).toBeNull()
    expect(result.current.optLabel).toBe('')
    expect(result.current.optValue).toBe('')
  })

  it('tracks the new-list name as it is typed', () => {
    const { result } = renderHook(() => useConfigUi())
    act(() => {
      result.current.setNewListName('Status')
    })
    expect(result.current.newListName).toBe('Status')
  })

  it('tracks which list is selected', () => {
    const { result } = renderHook(() => useConfigUi())
    act(() => {
      result.current.setSelectedId('d1')
    })
    expect(result.current.selectedId).toBe('d1')
  })

  it('clears both option fields together', () => {
    const { result } = renderHook(() => useConfigUi())
    act(() => {
      result.current.setOptLabel('Active')
      result.current.setOptValue('active')
    })
    act(() => {
      result.current.resetOpt()
    })
    expect(result.current.optLabel).toBe('')
    expect(result.current.optValue).toBe('')
  })

  it('leaves the list state alone when resetting the option fields', () => {
    const { result } = renderHook(() => useConfigUi())
    act(() => {
      result.current.setSelectedId('d1')
      result.current.setOptLabel('Active')
    })
    act(() => {
      result.current.resetOpt()
    })
    expect(result.current.selectedId).toBe('d1')
  })
})
