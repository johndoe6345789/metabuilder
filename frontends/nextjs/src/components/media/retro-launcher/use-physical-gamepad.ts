'use client'

import { useEffect, useRef, useState } from 'react'
import { buttonsDown, type GamepadSnapshot } from './gamepad-map'
import { heldButtons } from './held-buttons'
import { GAMEPAD_BUTTONS } from './key-map'

type ConnectedPad = GamepadSnapshot & { id: string }

/**
 * The first pad reporting itself as connected, or null.
 *
 * `getGamepads` is typed as always present and is not: jsdom has none,
 * and neither do some embedded browsers -- calling it blind would throw
 * once a frame.
 */
function firstConnected(): ConnectedPad | null {
  if (typeof navigator === 'undefined') return null
  const read = (navigator as Partial<Navigator>).getGamepads
  if (typeof read !== 'function') return null
  for (const pad of read.call(navigator)) {
    if (pad?.connected === true) return pad
  }
  return null
}

/**
 * Plays with a real controller.
 *
 * The browser has offered `navigator.getGamepads()` for years and the
 * launcher used none of it: an on-screen pad and a keyboard were the
 * only ways to play a retro game. A gamepad reports no events for its
 * buttons -- it has to be polled -- so this reads it once a frame while
 * a session is running and sends only what changed.
 */
export function usePhysicalGamepad(
  active: boolean,
  sendInput: (button: string, pressed: boolean) => Promise<void>
): { controller: string | null } {
  const [controller, setController] = useState<string | null>(null)
  const send = useRef(sendInput)
  useEffect(() => {
    send.current = sendInput
  }, [sendInput])

  useEffect(() => {
    if (!active) return undefined
    const held = heldButtons((button, pressed) => {
      void send.current(button, pressed)
    })
    let frame = 0
    let seen: string | null = null

    const poll = (): void => {
      const pad = firstConnected()
      const id = pad === null ? null : pad.id
      if (id !== seen) {
        seen = id
        setController(id)
        // A controller unplugged mid-game would otherwise leave whatever
        // it was holding pressed for ever.
        if (pad === null) held.releaseAll()
      }
      if (pad !== null) {
        const down = new Set(buttonsDown(pad))
        for (const button of GAMEPAD_BUTTONS) {
          if (down.has(button)) held.press(button)
          else held.release(button)
        }
      }
      frame = requestAnimationFrame(poll)
    }

    frame = requestAnimationFrame(poll)
    return () => {
      cancelAnimationFrame(frame)
      held.releaseAll()
    }
  }, [active])

  return { controller }
}
