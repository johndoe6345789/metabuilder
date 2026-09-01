import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ConsoleOutput } from './ConsoleOutput'

beforeEach(() => {
  Element.prototype.scrollIntoView = () => undefined
})

describe('ConsoleOutput', () => {
  it('shows "No output" when there are no lines', () => {
    render(<ConsoleOutput lines={[]} />)
    expect(screen.getByText('No output')).toBeTruthy()
  })

  it('renders each line', () => {
    render(<ConsoleOutput lines={['first', 'second']} />)
    expect(screen.getByText('first')).toBeTruthy()
    expect(screen.getByText('second')).toBeTruthy()
  })

  it('Clear empties the local lines, independent of the prop', () => {
    render(<ConsoleOutput lines={['first']} />)
    fireEvent.click(screen.getByText('Clear'))
    expect(screen.getByText('No output')).toBeTruthy()
  })

  it('re-syncs from a new lines prop after Clear', () => {
    const lines = ['first']
    const { rerender } = render(<ConsoleOutput lines={lines} />)
    fireEvent.click(screen.getByText('Clear'))
    expect(screen.getByText('No output')).toBeTruthy()

    rerender(<ConsoleOutput lines={[...lines, 'second']} />)

    expect(screen.getByText('first')).toBeTruthy()
    expect(screen.getByText('second')).toBeTruthy()
  })

  it('does not resync when the same array reference re-renders', () => {
    const lines = ['first']
    const { rerender } = render(<ConsoleOutput lines={lines} />)
    fireEvent.click(screen.getByText('Clear'))

    rerender(<ConsoleOutput lines={lines} />)

    expect(screen.getByText('No output')).toBeTruthy()
  })
})
