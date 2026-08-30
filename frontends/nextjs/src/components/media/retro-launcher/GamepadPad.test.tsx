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
    fireEvent.pointerUp(screen.getByText('b'))
    expect(onPress).toHaveBeenCalledWith('b', false)
  })
})
