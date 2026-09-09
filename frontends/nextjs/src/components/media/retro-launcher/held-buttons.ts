/**
 * Which buttons are down, so only changes are sent.
 *
 * Holding a direction fires `keydown` at the OS repeat rate -- tens of
 * events a second -- and each one was posted to the daemon as a fresh
 * press. That is a flood of identical requests for one held button, and
 * lag in an emulator is the difference between playable and not.
 *
 * It also guarantees the release. A key held while the window loses
 * focus never gets its `keyup`, so the button stayed down for ever and
 * the character ran into the wall until you pressed and let go again.
 */
export interface HeldButtons {
  press: (button: string) => void
  release: (button: string) => void
  /** Everything still down, released. For losing focus, or going away. */
  releaseAll: () => void
  isHeld: (button: string) => boolean
}

export function heldButtons(
  send: (button: string, pressed: boolean) => void
): HeldButtons {
  const down = new Set<string>()

  return {
    press: button => {
      if (down.has(button)) return
      down.add(button)
      send(button, true)
    },
    release: button => {
      if (!down.has(button)) return
      down.delete(button)
      send(button, false)
    },
    releaseAll: () => {
      for (const button of [...down]) {
        down.delete(button)
        send(button, false)
      }
    },
    isHeld: button => down.has(button),
  }
}
