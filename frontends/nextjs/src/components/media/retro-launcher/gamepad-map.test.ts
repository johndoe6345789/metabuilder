import { describe, expect, it } from 'vitest'

import { AXIS_DEADZONE, buttonsDown } from './gamepad-map'

const pad = (
  pressedIndexes: number[] = [],
  axes: number[] = [0, 0]
): { buttons: { pressed: boolean }[]; axes: number[] } => ({
  buttons: Array.from({ length: 16 }, (_, i) => ({
    pressed: pressedIndexes.includes(i),
  })),
  axes,
})

/**
 * The launcher had an on-screen pad and a keyboard and nothing for the
 * controller most people would plug in to play a retro game.
 */
describe('buttonsDown', () => {
  it.each([
    [0, 'b'],
    [1, 'a'],
    [2, 'y'],
    [3, 'x'],
    [4, 'l'],
    [5, 'r'],
    [8, 'select'],
    [9, 'start'],
  ])('reads standard button %i as %s', (index, name) => {
    expect(buttonsDown(pad([index]))).toEqual([name])
  })

  it.each([
    [12, 'up'],
    [13, 'down'],
    [14, 'left'],
    [15, 'right'],
  ])('reads d-pad %i as %s', (index, name) => {
    expect(buttonsDown(pad([index]))).toEqual([name])
  })

  it('holds several at once', () => {
    expect(buttonsDown(pad([1, 15])).sort()).toEqual(['a', 'right'])
  })

  it('ignores a button with no meaning here', () => {
    expect(buttonsDown(pad([16]))).toEqual([])
  })

  it('is empty for a pad at rest', () => {
    expect(buttonsDown(pad())).toEqual([])
  })
})

/** Plenty of controllers report the stick and no d-pad at all. */
describe('the left stick', () => {
  it.each([
    [[-1, 0], 'left'],
    [[1, 0], 'right'],
    [[0, -1], 'up'],
    [[0, 1], 'down'],
  ])('reads %p as %s', (axes, name) => {
    expect(buttonsDown(pad([], axes))).toEqual([name])
  })

  it('reads a diagonal as both', () => {
    expect(buttonsDown(pad([], [-1, -1])).sort()).toEqual(['left', 'up'])
  })

  it('ignores a thumb resting inside the deadzone', () => {
    const drift = AXIS_DEADZONE - 0.01
    expect(buttonsDown(pad([], [drift, -drift]))).toEqual([])
  })

  it('does not report the same direction twice with the d-pad', () => {
    expect(buttonsDown(pad([14], [-1, 0]))).toEqual(['left'])
  })

  it('copes with a pad reporting no axes', () => {
    expect(buttonsDown({ buttons: [], axes: [] })).toEqual([])
  })
})
