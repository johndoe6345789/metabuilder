import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { usePhysicalGamepad } from './use-physical-gamepad'

interface FakePad {
  id: string
  connected: boolean
  buttons: { pressed: boolean }[]
  axes: number[]
}

const pad = (over: Partial<FakePad> = {}): FakePad => ({
  id: 'Fake Controller',
  connected: true,
  buttons: Array.from({ length: 16 }, () => ({ pressed: false })),
  axes: [0, 0],
  ...over,
})

let pads: (FakePad | null)[]
let frames: (() => void)[]

/** One animation frame, the way the browser would give us one. */
const tick = () => {
  const due = frames
  frames = []
  act(() => {
    due.forEach(run => {
      run()
    })
  })
}

beforeEach(() => {
  pads = []
  frames = []
  vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
    frames.push(cb)
    return frames.length
  })
  vi.stubGlobal('cancelAnimationFrame', () => undefined)
  Object.defineProperty(navigator, 'getGamepads', {
    configurable: true,
    value: () => pads,
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const press = (index: number) => {
  const p = pad()
  p.buttons[index].pressed = true
  return p
}

/**
 * The browser has offered getGamepads() for years and the launcher used
 * none of it: an on-screen pad and a keyboard were the only ways to
 * play a retro game.
 */
describe('usePhysicalGamepad', () => {
  it('sends a press from a real controller', () => {
    const send = vi.fn(async () => undefined)
    renderHook(() => usePhysicalGamepad(true, send))
    pads = [press(1)]

    tick()

    expect(send).toHaveBeenCalledWith('a', true)
  })

  it('sends the release when the button comes back up', () => {
    const send = vi.fn(async () => undefined)
    renderHook(() => usePhysicalGamepad(true, send))
    pads = [press(1)]
    tick()
    send.mockClear()

    pads = [pad()]
    tick()

    expect(send).toHaveBeenCalledWith('a', false)
  })

  /** A pad is polled, not evented: the same frame repeats for as long as
   *  a button is held. */
  it('sends one press however many frames it is held for', () => {
    const send = vi.fn(async () => undefined)
    renderHook(() => usePhysicalGamepad(true, send))
    pads = [press(1)]

    tick()
    tick()
    tick()

    expect(send.mock.calls.filter(c => c[1] === true)).toHaveLength(1)
  })

  it('names the controller once it is seen', () => {
    const send = vi.fn(async () => undefined)
    const view = renderHook(() => usePhysicalGamepad(true, send))
    expect(view.result.current.controller).toBeNull()

    pads = [pad()]
    tick()

    expect(view.result.current.controller).toBe('Fake Controller')
  })

  it('ignores a pad that says it is disconnected', () => {
    const send = vi.fn(async () => undefined)
    const view = renderHook(() => usePhysicalGamepad(true, send))
    pads = [pad({ connected: false })]

    tick()

    expect(view.result.current.controller).toBeNull()
    expect(send).not.toHaveBeenCalled()
  })

  /** Unplugging mid-game would otherwise leave whatever it held pressed. */
  it('lets go of everything when the controller is unplugged', () => {
    const send = vi.fn(async () => undefined)
    renderHook(() => usePhysicalGamepad(true, send))
    pads = [press(1)]
    tick()
    send.mockClear()

    pads = []
    tick()

    expect(send).toHaveBeenCalledWith('a', false)
  })

  it('lets go when the session ends', () => {
    const send = vi.fn(async () => undefined)
    const view = renderHook(() => usePhysicalGamepad(true, send))
    pads = [press(15)]
    tick()
    send.mockClear()

    view.unmount()

    expect(send).toHaveBeenCalledWith('right', false)
  })

  it('does not poll while no session is running', () => {
    const send = vi.fn(async () => undefined)
    renderHook(() => usePhysicalGamepad(false, send))
    pads = [press(1)]

    tick()

    expect(send).not.toHaveBeenCalled()
  })
})
