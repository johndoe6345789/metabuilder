'use client'

import { GAMEPAD_BUTTONS } from './key-map'
import s from '../RetroLauncher.module.scss'

export interface GamepadPadProps {
  onPress: (button: string, pressed: boolean) => void
}

export function GamepadPad({ onPress }: GamepadPadProps) {
  return (
    <div className={s.pad}>
      {GAMEPAD_BUTTONS.map(btn => (
        <button
          key={btn}
          className={s.padBtn}
          onPointerDown={() => {
            onPress(btn, true)
          }}
          onPointerUp={() => {
            onPress(btn, false)
          }}
        >
          {btn}
        </button>
      ))}
    </div>
  )
}
