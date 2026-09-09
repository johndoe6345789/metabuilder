'use client'

import { useRef } from 'react'
import { GAMEPAD_BUTTONS } from './key-map'
import { heldButtons } from './held-buttons'
import s from '../RetroLauncher.module.scss'

/**
 * Pointer capture, where it exists.
 *
 * jsdom does not implement it, and neither do some older browsers; a
 * throw inside onPointerDown would take the whole pad down.
 */
function capture(target: Element, pointerId: number): void {
  const take = (target as Partial<Element>).setPointerCapture
  if (typeof take === 'function') take.call(target, pointerId)
}

export interface GamepadPadProps {
  onPress: (button: string, pressed: boolean) => void
}

/**
 * The on-screen pad.
 *
 * A press was released on `pointerup` alone, which lands on whatever is
 * under the pointer -- so sliding a thumb off the d-pad, the ordinary
 * way anyone plays, released nothing and left the button down for ever.
 * Capturing the pointer keeps the events on the button that took the
 * press, and cancel/lost-capture cover the rest.
 */
export function GamepadPad({ onPress }: GamepadPadProps) {
  const held = useRef(heldButtons(onPress))

  return (
    <div className={s.pad}>
      {GAMEPAD_BUTTONS.map(btn => (
        <button
          key={btn}
          className={s.padBtn}
          type="button"
          onPointerDown={e => {
            capture(e.currentTarget, e.pointerId)
            held.current.press(btn)
          }}
          onPointerUp={() => {
            held.current.release(btn)
          }}
          onPointerCancel={() => {
            held.current.release(btn)
          }}
          onLostPointerCapture={() => {
            held.current.release(btn)
          }}
        >
          {btn}
        </button>
      ))}
    </div>
  )
}
