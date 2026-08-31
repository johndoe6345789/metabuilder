import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { setup, focusInput } from './search-select-test-helpers'

// Choosing a result -- split out of SearchSelect.test.tsx (which covers
// opening/searching) to stay under the 80-line file limit.

describe('SearchSelect choosing', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reports the chosen item to the caller', async () => {
    const { onSelect } = setup()
    focusInput()

    await waitFor(() => screen.getByText('name-a'))
    fireEvent.click(screen.getByText('name-a'))

    expect(onSelect).toHaveBeenCalledWith({ id: 'a', label: 'name-a' })
  })

  it('clears the list after choosing', async () => {
    const { onSelect } = setup()
    focusInput()

    await waitFor(() => screen.getByText('name-a'))
    fireEvent.click(screen.getByText('name-a'))

    await waitFor(() => {
      expect(screen.queryByText('name-b')).toBeNull()
    })
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('picks the highlighted item on Enter', async () => {
    const { onSelect } = setup()
    const input = focusInput()

    await waitFor(() => screen.getByText('name-a'))
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledWith({ id: 'b', label: 'name-b' })
  })

  it('does not run past the end of the list', async () => {
    const { onSelect } = setup()
    const input = focusInput()

    await waitFor(() => screen.getByText('name-a'))
    for (let i = 0; i < 5; i += 1) {
      fireEvent.keyDown(input, { key: 'ArrowDown' })
    }
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledWith({ id: 'b', label: 'name-b' })
  })

  it('does not run past the start of the list', async () => {
    const { onSelect } = setup()
    const input = focusInput()

    await waitFor(() => screen.getByText('name-a'))
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledWith({ id: 'a', label: 'name-a' })
  })
})
