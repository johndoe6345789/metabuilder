import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MediaUrlInput } from './MediaUrlInput'

describe('MediaUrlInput', () => {
  it('renders the placeholder and current value', () => {
    render(
      <MediaUrlInput
        placeholder="Paste a video URL"
        value="https://example.com/video.mp4"
        onChange={vi.fn()}
        onLoad={vi.fn()}
      />
    )
    const input = screen.getByPlaceholderText(
      'Paste a video URL'
    ) as HTMLInputElement
    expect(input.value).toBe('https://example.com/video.mp4')
  })

  it('calls onChange with the typed value', () => {
    const onChange = vi.fn()
    render(
      <MediaUrlInput
        placeholder="Paste a URL"
        value=""
        onChange={onChange}
        onLoad={vi.fn()}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('Paste a URL'), {
      target: { value: 'https://example.com/a.mp3' },
    })
    expect(onChange).toHaveBeenCalledWith('https://example.com/a.mp3')
  })

  it('disables Load when the value is blank or whitespace', () => {
    render(
      <MediaUrlInput
        placeholder="Paste a URL"
        value="   "
        onChange={vi.fn()}
        onLoad={vi.fn()}
      />
    )
    const button = screen.getByText('Load').closest('button')
    expect(button?.disabled).toBe(true)
  })

  it('enables Load and calls onLoad when clicked with a value', () => {
    const onLoad = vi.fn()
    render(
      <MediaUrlInput
        placeholder="Paste a URL"
        value="https://example.com/x.mp4"
        onChange={vi.fn()}
        onLoad={onLoad}
      />
    )
    const button = screen.getByText('Load').closest('button')
    expect(button?.disabled).toBe(false)
    button?.click()
    expect(onLoad).toHaveBeenCalledOnce()
  })
})
