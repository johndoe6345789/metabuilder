import { describe, expect, it, vi } from 'vitest'

import { heldButtons } from './held-buttons'

const setup = () => {
  const send = vi.fn()
  return { send, held: heldButtons(send) }
}

/**
 * Holding a direction fires keydown at the OS repeat rate, and each
 * repeat was posted to the daemon as a fresh press -- tens of identical
 * requests a second for one held button.
 */
describe('heldButtons', () => {
  it('sends a press once, however many times it is asked', () => {
    const { send, held } = setup()

    held.press('right')
    held.press('right')
    held.press('right')

    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith('right', true)
  })

  it('sends the release', () => {
    const { send, held } = setup()
    held.press('right')

    held.release('right')

    expect(send).toHaveBeenLastCalledWith('right', false)
  })

  it('does not release a button that was not down', () => {
    const { send, held } = setup()

    held.release('right')

    expect(send).not.toHaveBeenCalled()
  })

  it('can be pressed again after release', () => {
    const { send, held } = setup()

    held.press('a')
    held.release('a')
    held.press('a')

    expect(send.mock.calls).toEqual([
      ['a', true],
      ['a', false],
      ['a', true],
    ])
  })

  it('holds several at once', () => {
    const { held } = setup()

    held.press('right')
    held.press('a')

    expect(held.isHeld('right')).toBe(true)
    expect(held.isHeld('a')).toBe(true)
  })

  /**
   * A key held while the window loses focus never gets its keyup, so the
   * button stayed down for ever and the character ran into the wall.
   */
  it('releases everything still down', () => {
    const { send, held } = setup()
    held.press('right')
    held.press('a')
    send.mockClear()

    held.releaseAll()

    expect(send.mock.calls.sort()).toEqual([
      ['a', false],
      ['right', false],
    ])
    expect(held.isHeld('right')).toBe(false)
  })

  it('releases nothing twice', () => {
    const { send, held } = setup()
    held.press('a')

    held.releaseAll()
    held.releaseAll()

    expect(send).toHaveBeenCalledTimes(2)
  })
})
