/**
 * A real controller, mapped to the buttons the daemon knows.
 *
 * The launcher had an on-screen pad and a keyboard, and nothing for the
 * controller most people would actually plug in to play a retro game.
 * The browser has offered `navigator.getGamepads()` for years.
 *
 * Face buttons follow the W3C "standard" mapping by position, and the
 * position-to-name choice is the SNES one, which is what these cores
 * expect: south is B, east is A, west is Y, north is X. On an
 * Xbox-shaped pad that means the button under your thumb is B, exactly
 * as it is on the original hardware.
 */

/** Anything below this on a stick axis is a thumb resting, not a press. */
export const AXIS_DEADZONE = 0.5

const BY_INDEX: Partial<Record<number, string>> = {
  0: 'b', // south
  1: 'a', // east
  2: 'y', // west
  3: 'x', // north
  4: 'l',
  5: 'r',
  8: 'select',
  9: 'start',
  12: 'up',
  13: 'down',
  14: 'left',
  15: 'right',
}

/** The shape this reads; the real Gamepad has far more on it. */
export interface GamepadSnapshot {
  buttons: readonly { pressed: boolean }[]
  axes: readonly number[]
}

/**
 * Every button currently down, by the daemon's name.
 *
 * The left stick counts as the d-pad: a controller whose stick reports
 * no d-pad at all is common, and a player pushing the stick left means
 * left.
 */
export function buttonsDown(pad: GamepadSnapshot): string[] {
  const down = new Set<string>()

  pad.buttons.forEach((button, index) => {
    const name = BY_INDEX[index]
    if (button.pressed && name !== undefined) down.add(name)
  })

  const [x = 0, y = 0] = pad.axes
  if (x <= -AXIS_DEADZONE) down.add('left')
  if (x >= AXIS_DEADZONE) down.add('right')
  if (y <= -AXIS_DEADZONE) down.add('up')
  if (y >= AXIS_DEADZONE) down.add('down')

  return [...down]
}
