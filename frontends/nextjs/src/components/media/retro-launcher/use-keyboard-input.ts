'use client'

import { useCallback, useEffect } from 'react'
import { KEY_MAP } from './key-map'

/** Forwards keydown/keyup as gamepad button presses while a session is
 *  active -- unmounted (and un-listened) once it ends. */
export function useKeyboardInput(
  active: boolean,
  sendInput: (button: string, pressed: boolean) => Promise<void>
) {
  const handleKey = useCallback(
    (e: KeyboardEvent, pressed: boolean) => {
      const btn = KEY_MAP[e.key]
      if (btn === undefined) return
      e.preventDefault()
      void sendInput(btn, pressed)
    },
    [sendInput]
  )

  useEffect(() => {
    if (!active) return undefined
    const down = (e: KeyboardEvent) => {
      handleKey(e, true)
    }
    const up = (e: KeyboardEvent) => {
      handleKey(e, false)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [active, handleKey])
}
