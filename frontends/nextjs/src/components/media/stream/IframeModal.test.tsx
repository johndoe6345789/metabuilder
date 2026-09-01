import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { IframeModal } from './IframeModal'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('IframeModal', () => {
  it('renders the iframe with the given name and url', () => {
    render(<IframeModal name="Twitch" url="https://x.com" onClose={vi.fn()} />)
    const frame = screen.getByTitle('Twitch') as HTMLIFrameElement
    expect(frame.src).toBe('https://x.com/')
  })

  it('does not show the fallback link before the delay', () => {
    render(<IframeModal name="Twitch" url="https://x.com" onClose={vi.fn()} />)
    expect(screen.queryByText(/Open in new tab/)).toBeNull()
  })

  it('shows a fallback link after the delay', () => {
    render(<IframeModal name="Twitch" url="https://x.com" onClose={vi.fn()} />)
    act(() => {
      vi.advanceTimersByTime(3500)
    })
    expect(screen.getByText(/Open in new tab/)).toBeTruthy()
  })

  it('calls onClose when the overlay is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(
      <IframeModal name="Twitch" url="https://x.com" onClose={onClose} />
    )
    fireEvent.click(container.firstChild as Element)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose when the panel itself is clicked', () => {
    const onClose = vi.fn()
    render(<IframeModal name="Twitch" url="https://x.com" onClose={onClose} />)
    fireEvent.click(screen.getByTitle('Twitch'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<IframeModal name="Twitch" url="https://x.com" onClose={onClose} />)
    screen.getByLabelText('Close').click()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose on Escape', () => {
    const onClose = vi.fn()
    render(<IframeModal name="Twitch" url="https://x.com" onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('ignores other keys', () => {
    const onClose = vi.fn()
    render(<IframeModal name="Twitch" url="https://x.com" onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('removes the keydown listener on unmount', () => {
    const onClose = vi.fn()
    const { unmount } = render(
      <IframeModal name="Twitch" url="https://x.com" onClose={onClose} />
    )
    unmount()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
