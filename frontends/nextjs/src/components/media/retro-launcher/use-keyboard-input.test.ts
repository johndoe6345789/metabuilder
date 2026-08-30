import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useKeyboardInput } from './use-keyboard-input'

describe('useKeyboardInput', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does nothing while inactive', () => {
    const sendInput = vi.fn(async () => {})
    renderHook(() => useKeyboardInput(false, sendInput))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))

    expect(sendInput).not.toHaveBeenCalled()
  })

  it('translates a mapped key to a button press', () => {
    const sendInput = vi.fn(async () => {})
    renderHook(() => useKeyboardInput(true, sendInput))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))

    expect(sendInput).toHaveBeenCalledWith('up', true)
  })

  it('sends release on keyup', () => {
    const sendInput = vi.fn(async () => {})
    renderHook(() => useKeyboardInput(true, sendInput))

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'z' }))

    expect(sendInput).toHaveBeenCalledWith('a', false)
  })

  it('ignores keys with no mapping', () => {
    const sendInput = vi.fn(async () => {})
    renderHook(() => useKeyboardInput(true, sendInput))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F1' }))

    expect(sendInput).not.toHaveBeenCalled()
  })

  it('stops listening once inactive again', () => {
    const sendInput = vi.fn(async () => {})
    const { rerender } = renderHook(
      ({ active }) => useKeyboardInput(active, sendInput),
      { initialProps: { active: true } }
    )

    rerender({ active: false })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))

    expect(sendInput).not.toHaveBeenCalled()
  })
})
