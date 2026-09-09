'use client'

import { useEffect, useRef } from 'react'
import { heldButtons } from './held-buttons'
import { KEY_MAP } from './key-map'

/**
 * Forwards keydown/keyup as gamepad button presses while a session is
 * active.
 *
 * Only transitions are sent: a held key repeats at the OS rate and every
 * repeat used to be posted to the daemon. And everything still down is
 * released when the window loses focus or the session ends -- a key held
 * through an alt-tab never gets its keyup, so the button stayed down and
 * the character kept running.
 */
export function useKeyboardInput(
  active: boolean,
  sendInput: (button: string, pressed: boolean) => Promise<void>
) {
  // Kept in a ref so a fresh `sendInput` closure each render does not
  // tear the listeners down and put them back mid-game.
  const send = useRef(sendInput)
  useEffect(() => {
    send.current = sendInput
  }, [sendInput])

  useEffect(() => {
    if (!active) return undefined
    const held = heldButtons((button, pressed) => {
      void send.current(button, pressed)
    })

    const onKey = (e: KeyboardEvent, pressed: boolean): void => {
      const button = KEY_MAP[e.key]
      if (button === undefined) return
      // The arrow keys scroll the page otherwise, which is not what
      // pressing right in a game is meant to do.
      e.preventDefault()
      if (pressed) held.press(button)
      else held.release(button)
    }

    const down = (e: KeyboardEvent) => {
      // A repeat is the same press continuing, not a new one.
      if (e.repeat) {
        if (KEY_MAP[e.key] !== undefined) e.preventDefault()
        return
      }
      onKey(e, true)
    }
    const up = (e: KeyboardEvent) => {
      onKey(e, false)
    }
    const letGo = () => {
      held.releaseAll()
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', letGo)
    document.addEventListener('visibilitychange', letGo)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', letGo)
      document.removeEventListener('visibilitychange', letGo)
      // Ending the session with a button down would leave it down.
      held.releaseAll()
    }
  }, [active])
}
