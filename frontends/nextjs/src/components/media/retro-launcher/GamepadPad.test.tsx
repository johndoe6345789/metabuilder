import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { GamepadPad } from './GamepadPad'

describe('GamepadPad', () => {
  it('renders a button for every mapped input', () => {
    render(<GamepadPad onPress={vi.fn()} />)
    expect(screen.getByText('start')).toBeTruthy()
    expect(screen.getByText('select')).toBeTruthy()
  })

  it('reports a press on pointer down', () => {
    const onPress = vi.fn()
    render(<GamepadPad onPress={onPress} />)
    fireEvent.pointerDown(screen.getByText('a'))
    expect(onPress).toHaveBeenCalledWith('a', true)
  })

  it('reports a release on pointer up', () => {
    const onPress = vi.fn()
    render(<GamepadPad onPress={onPress} />)
    fireEvent.pointerDown(screen.getByText('b'))
    fireEvent.pointerUp(screen.getByText('b'))
    expect(onPress).toHaveBeenCalledWith('b', false)
  })
})

/**
 * A press was released on `pointerup` alone, which lands on whatever is
 * under the pointer -- so sliding a thumb off the d-pad, the ordinary
 * way anyone plays, released nothing and left the button down for ever.
 */
describe('letting go of a button', () => {
  const pad = () => {
    const onPress = vi.fn()
    render(<GamepadPad onPress={onPress} />)
    const button = screen.getByRole('button', { name: 'right' })
    button.setPointerCapture = vi.fn()
    button.releasePointerCapture = vi.fn()
    return { onPress, button }
  }

  const down = (button: HTMLElement) => {
    fireEvent.pointerDown(button, { pointerId: 1 })
  }

  it('keeps the events on the button that took the press', () => {
    const { button } = pad()

    down(button)

    expect(button.setPointerCapture).toHaveBeenCalledWith(1)
  })

  it('releases when the pointer is lifted', () => {
    const { onPress, button } = pad()

    down(button)
    fireEvent.pointerUp(button, { pointerId: 1 })

    expect(onPress).toHaveBeenLastCalledWith('right', false)
  })

  it.each(['pointerCancel', 'lostPointerCapture'] as const)(
    'releases on %s, so the button cannot stick',
    event => {
      const { onPress, button } = pad()

      down(button)
      fireEvent[event](button, { pointerId: 1 })

      expect(onPress).toHaveBeenLastCalledWith('right', false)
    }
  )

  it('sends one press however many events arrive', () => {
    const { onPress, button } = pad()

    down(button)
    down(button)

    expect(onPress.mock.calls.filter(c => c[1] === true)).toHaveLength(1)
  })
})
