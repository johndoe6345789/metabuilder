import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useKeyboardInput } from './use-keyboard-input'

/** A key event on the window, the way a browser sends one. */
const fire = (
  type: 'keydown' | 'keyup',
  key: string,
  init: KeyboardEventInit = {}
) => {
  window.dispatchEvent(new KeyboardEvent(type, { key, ...init }))
}

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

  it('sends release on keyup for a key it saw pressed', () => {
    const sendInput = vi.fn(async () => {})
    renderHook(() => useKeyboardInput(true, sendInput))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }))
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

/**
 * A held key repeats at the OS rate -- tens of events a second -- and
 * every repeat used to be posted to the daemon as a fresh press.
 */
describe('a key held down', () => {
  it('is sent once, not once per repeat', () => {
    const send = vi.fn(async () => undefined)
    renderHook(() => useKeyboardInput(true, send))

    fire('keydown', 'ArrowRight')
    fire('keydown', 'ArrowRight', { repeat: true })
    fire('keydown', 'ArrowRight', { repeat: true })

    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith('right', true)
  })

  it('is released once', () => {
    const send = vi.fn(async () => undefined)
    renderHook(() => useKeyboardInput(true, send))
    fire('keydown', 'ArrowRight')
    send.mockClear()

    fire('keyup', 'ArrowRight')
    fire('keyup', 'ArrowRight')

    expect(send.mock.calls).toEqual([['right', false]])
  })
})

/**
 * A key held through an alt-tab never gets its keyup, so the button
 * stayed down for ever and the character ran into the wall.
 */
describe('losing focus with a button down', () => {
  it('lets go of it', () => {
    const send = vi.fn(async () => undefined)
    renderHook(() => useKeyboardInput(true, send))
    fire('keydown', 'ArrowRight')
    send.mockClear()

    window.dispatchEvent(new Event('blur'))

    expect(send).toHaveBeenCalledWith('right', false)
  })

  it('lets go when the tab is hidden', () => {
    const send = vi.fn(async () => undefined)
    renderHook(() => useKeyboardInput(true, send))
    fire('keydown', 'z')
    send.mockClear()

    document.dispatchEvent(new Event('visibilitychange'))

    expect(send).toHaveBeenCalledWith('a', false)
  })

  it('lets go when the session ends', () => {
    const send = vi.fn(async () => undefined)
    const view = renderHook(() => useKeyboardInput(true, send))
    fire('keydown', 'ArrowLeft')
    send.mockClear()

    view.unmount()

    expect(send).toHaveBeenCalledWith('left', false)
  })
})
